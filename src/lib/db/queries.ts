import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createEventSlug } from "@/lib/utils/slug";
import { scoreStatus } from "@/lib/utils/scoring";
import { EventDetail, EventRecord } from "@/types/event";
import {
  EventDateResult,
  EventResultsPayload,
  ResponseItemRecord,
  ResponseRecord,
  ResponseStatus,
  ResponseWithItems,
} from "@/types/response";

type CreateEventInput = {
  title: string;
  description: string;
  language: "ja" | "zh" | "en" | "ko";
  candidateDates: string[];
};

type UpdateEventInput = {
  id: string;
  title: string;
  description: string;
  language: "ja" | "zh" | "en" | "ko";
  candidateDates: string[];
};

type AdminUpdateEventInput = {
  id: string;
  title: string;
  description: string;
  language: "ja" | "zh" | "en" | "ko";
  responseDeadline: string | null;
  receptionStatus: "open" | "paused" | "closed";
  shareEnabled: boolean;
  candidateDates: Array<{
    id?: string;
    candidateDate: string;
    displayOrder: number;
  }>;
};

type CreateResponseInput = {
  eventId: string;
  responseId?: string;
  name: string;
  comment?: string;
  items: Array<{
    eventDateId: string;
    status: ResponseStatus;
  }>;
};

type AdminUpdateResponseInput = {
  eventId: string;
  responseId: string;
  name: string;
  comment?: string;
  items: Array<{
    eventDateId: string;
    status: ResponseStatus;
  }>;
};

type EventDateRow = {
  id: string;
  candidate_date: string;
  display_order: number | null;
};

function normalizeDisplayOrder(index: number, value?: number | null) {
  return value ?? index;
}

function mapEventDetail(event: EventRecord, candidateDates: EventDateRow[]): EventDetail {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    language: event.language,
    responseDeadline: event.response_deadline,
    receptionStatus: event.reception_status,
    shareEnabled: event.share_enabled,
    createdAt: event.created_at,
    candidateDates: candidateDates.map((date, index) => ({
      id: date.id,
      candidateDate: date.candidate_date,
      displayOrder: normalizeDisplayOrder(index, date.display_order),
    })),
  };
}

async function fetchEventDates(eventId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("event_dates")
    .select("id, candidate_date, display_order")
    .eq("event_id", eventId)
    .order("display_order", { ascending: true })
    .order("candidate_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as EventDateRow[];
}

export async function createEvent(input: CreateEventInput) {
  const supabase = createSupabaseServerClient();
  const slug = createEventSlug(input.title);

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description || null,
      language: input.language,
      slug,
      response_deadline: null,
      reception_status: "open",
      share_enabled: true,
    })
    .select("*")
    .single<EventRecord>();

  if (eventError || !event) {
    throw new Error(eventError?.message || "Failed to create event");
  }

  const { error: datesError } = await supabase.from("event_dates").insert(
    input.candidateDates.map((candidateDate, index) => ({
      event_id: event.id,
      candidate_date: candidateDate,
      display_order: index,
    })),
  );

  if (datesError) {
    throw new Error(datesError.message);
  }

  return event;
}

export async function getEventById(id: string) {
  const supabase = createSupabaseServerClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single<EventRecord>();

  if (eventError || !event) {
    return null;
  }

  const dates = await fetchEventDates(event.id);
  return mapEventDetail(event, dates);
}

export async function getEventBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single<EventRecord>();

  if (eventError || !event) {
    return null;
  }

  const dates = await fetchEventDates(event.id);
  return mapEventDetail(event, dates);
}

export async function updateEvent(input: UpdateEventInput) {
  const current = await getEventById(input.id);

  if (!current) {
    throw new Error("Event not found");
  }

  return updateEventAdmin({
    id: input.id,
    title: input.title,
    description: input.description,
    language: input.language,
    responseDeadline: current.responseDeadline,
    receptionStatus: current.receptionStatus,
    shareEnabled: current.shareEnabled,
    candidateDates: input.candidateDates.map((candidateDate, index) => ({
      id: current.candidateDates.find((item) => item.candidateDate === candidateDate)?.id,
      candidateDate,
      displayOrder: index,
    })),
  });
}

export async function updateEventAdmin(input: AdminUpdateEventInput) {
  const supabase = createSupabaseServerClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .update({
      title: input.title,
      description: input.description || null,
      language: input.language,
      response_deadline: input.responseDeadline,
      reception_status: input.receptionStatus,
      share_enabled: input.shareEnabled,
    })
    .eq("id", input.id)
    .select("*")
    .single<EventRecord>();

  if (eventError || !event) {
    throw new Error(eventError?.message || "Failed to update event");
  }

  const existingDates = await fetchEventDates(input.id);
  const existingById = new Map(existingDates.map((item) => [item.id, item]));
  const nextIds = new Set(input.candidateDates.flatMap((item) => (item.id ? [item.id] : [])));

  const removedDateIds = existingDates
    .filter((item) => !nextIds.has(item.id))
    .map((item) => item.id);

  if (removedDateIds.length > 0) {
    const { error: deleteItemsError } = await supabase
      .from("response_items")
      .delete()
      .in("event_date_id", removedDateIds);

    if (deleteItemsError) {
      throw new Error(deleteItemsError.message);
    }

    const { error: deleteDatesError } = await supabase
      .from("event_dates")
      .delete()
      .in("id", removedDateIds);

    if (deleteDatesError) {
      throw new Error(deleteDatesError.message);
    }
  }

  for (const item of input.candidateDates) {
    if (item.id && existingById.has(item.id)) {
      const { error } = await supabase
        .from("event_dates")
        .update({
          candidate_date: item.candidateDate,
          display_order: item.displayOrder,
        })
        .eq("id", item.id);

      if (error) {
        throw new Error(error.message);
      }
      continue;
    }

    const { error } = await supabase.from("event_dates").insert({
      event_id: input.id,
      candidate_date: item.candidateDate,
      display_order: item.displayOrder,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  return event;
}

async function validateEventDateItems(eventId: string, items: CreateResponseInput["items"]) {
  const supabase = createSupabaseServerClient();
  const { data: eventDates, error: eventDatesError } = await supabase
    .from("event_dates")
    .select("id")
    .eq("event_id", eventId);

  if (eventDatesError) {
    throw new Error(eventDatesError.message);
  }

  const validDateIds = new Set((eventDates || []).map((item) => item.id));

  if (
    items.length !== validDateIds.size ||
    items.some((item) => !validDateIds.has(item.eventDateId))
  ) {
    throw new Error("All event dates must be answered");
  }
}

export async function createResponse(input: CreateResponseInput) {
  await validateEventDateItems(input.eventId, input.items);
  const supabase = createSupabaseServerClient();

  if (input.responseId) {
    const { data: existingResponse, error: existingResponseError } = await supabase
      .from("responses")
      .select("*")
      .eq("id", input.responseId)
      .eq("event_id", input.eventId)
      .single<ResponseRecord>();

    if (existingResponseError || !existingResponse) {
      throw new Error(existingResponseError?.message || "Response not found");
    }

    const { data: updatedResponse, error: updateResponseError } = await supabase
      .from("responses")
      .update({
        name: input.name,
        comment: input.comment || null,
      })
      .eq("id", input.responseId)
      .select("*")
      .single<ResponseRecord>();

    if (updateResponseError || !updatedResponse) {
      throw new Error(updateResponseError?.message || "Failed to update response");
    }

    const { error: removeItemsError } = await supabase
      .from("response_items")
      .delete()
      .eq("response_id", input.responseId);

    if (removeItemsError) {
      throw new Error(removeItemsError.message);
    }

    const { error: insertItemsError } = await supabase.from("response_items").insert(
      input.items.map((item) => ({
        response_id: updatedResponse.id,
        event_date_id: item.eventDateId,
        status: item.status,
      })),
    );

    if (insertItemsError) {
      throw new Error(insertItemsError.message);
    }

    return updatedResponse;
  }

  const { data: response, error: responseError } = await supabase
    .from("responses")
    .insert({
      event_id: input.eventId,
      name: input.name,
      comment: input.comment || null,
    })
    .select("*")
    .single<ResponseRecord>();

  if (responseError || !response) {
    throw new Error(responseError?.message || "Failed to create response");
  }

  const { error: itemsError } = await supabase.from("response_items").insert(
    input.items.map((item) => ({
      response_id: response.id,
      event_date_id: item.eventDateId,
      status: item.status,
    })),
  );

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return response;
}

export async function updateResponseAdmin(input: AdminUpdateResponseInput) {
  return createResponse({
    eventId: input.eventId,
    responseId: input.responseId,
    name: input.name,
    comment: input.comment,
    items: input.items,
  });
}

export async function deleteResponseAdmin(eventId: string, responseId: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("responses")
    .delete()
    .eq("id", responseId)
    .eq("event_id", eventId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteEventAdmin(eventId: string) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getResponseByIdForEvent(eventId: string, responseId: string) {
  const supabase = createSupabaseServerClient();

  const { data: response, error: responseError } = await supabase
    .from("responses")
    .select("*")
    .eq("id", responseId)
    .eq("event_id", eventId)
    .single<ResponseRecord>();

  if (responseError || !response) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("response_items")
    .select("*")
    .eq("response_id", responseId);

    if (itemsError) {
    throw new Error(itemsError.message);
  }

  return {
    id: response.id,
    name: response.name,
    comment: response.comment,
    createdAt: response.created_at,
    items: (items || []).map((item) => ({
      eventDateId: item.event_date_id,
      status: item.status,
    })),
  } satisfies ResponseWithItems;
}

export async function getAllEventsForAdmin() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as EventRecord[];
}

export async function getAdminEventById(eventId: string) {
  const event = await getEventById(eventId);

  if (!event) {
    return null;
  }

  const results = await getEventResultsById(eventId);

  if (!results) {
    return null;
  }

  return {
    event,
    results,
  };
}

export async function getEventResultsById(id: string) {
  const event = await getEventById(id);

  if (!event) {
    return null;
  }

  return getEventResultsFromEvent(event);
}

export async function getEventResultsBySlug(slug: string) {
  const event = await getEventBySlug(slug);

  if (!event) {
    return null;
  }

  return getEventResultsFromEvent(event);
}

async function getEventResultsFromEvent(event: EventDetail) {
  const supabase = createSupabaseServerClient();
  const { data: responses, error: responsesError } = await supabase
    .from("responses")
    .select("*")
    .eq("event_id", event.id);

  if (responsesError) {
    throw new Error(responsesError.message);
  }

  const responseIds = (responses as ResponseRecord[]).map((response) => response.id);
  let responseItems: ResponseItemRecord[] = [];

  if (responseIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("response_items")
      .select("*")
      .in("response_id", responseIds);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    responseItems = (items || []) as ResponseItemRecord[];
  }

  const responsesWithItems: ResponseWithItems[] = (responses || [])
    .map((response) => ({
      id: response.id,
      name: response.name,
      comment: response.comment,
      createdAt: response.created_at,
      items: responseItems
        .filter((item) => item.response_id === response.id)
        .map((item) => ({
          eventDateId: item.event_date_id,
          status: item.status,
        })),
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const results: EventDateResult[] = event.candidateDates.map((date) => {
    const items = responseItems.filter((item) => item.event_date_id === date.id);
    const availableCount = items.filter((item) => item.status === "available").length;
    const maybeCount = items.filter((item) => item.status === "maybe").length;
    const unavailableCount = items.filter((item) => item.status === "unavailable").length;
    const score = items.reduce((sum, item) => sum + scoreStatus(item.status), 0);

    return {
      eventDateId: date.id,
      candidateDate: date.candidateDate,
      availableCount,
      maybeCount,
      unavailableCount,
      score,
    };
  });

  const rankedResults = [...results].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.availableCount !== a.availableCount) {
      return b.availableCount - a.availableCount;
    }

    return new Date(a.candidateDate).getTime() - new Date(b.candidateDate).getTime();
  });

  const totalResponses = responses?.length || 0;
  const bestCandidate = rankedResults[0] || null;
  const bestCandidates = bestCandidate
    ? rankedResults.filter(
        (result) =>
          result.score === bestCandidate.score &&
          result.availableCount === bestCandidate.availableCount,
      )
    : [];

  return {
    event: {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      language: event.language,
    },
    candidateDates: event.candidateDates,
    bestCandidates,
    bestCandidate,
    results,
    responses: responsesWithItems,
    totalResponses,
    responseRate: {
      answered: totalResponses,
      total: totalResponses,
      percentage: totalResponses > 0 ? 100 : 0,
    },
  } satisfies EventResultsPayload;
}
