import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createEventSlug } from "@/lib/utils/slug";
import { scoreStatus } from "@/lib/utils/scoring";
import { EventDetail, EventRecord } from "@/types/event";
import { EventDateResult, ResponseItemRecord, ResponseRecord } from "@/types/response";

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

type CreateResponseInput = {
  eventId: string;
  name: string;
  items: Array<{
    eventDateId: string;
    status: "available" | "maybe" | "unavailable";
  }>;
};

function mapEventDetail(
  event: EventRecord,
  candidateDates: Array<{ id: string; candidate_date: string }>,
): EventDetail {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    language: event.language,
    createdAt: event.created_at,
    candidateDates: candidateDates.map((date) => ({
      id: date.id,
      candidateDate: date.candidate_date,
    })),
  };
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
    })
    .select("*")
    .single<EventRecord>();

  if (eventError || !event) {
    throw new Error(eventError?.message || "Failed to create event");
  }

  const { error: datesError } = await supabase.from("event_dates").insert(
    input.candidateDates.map((candidateDate) => ({
      event_id: event.id,
      candidate_date: candidateDate,
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

  const { data: dates, error: datesError } = await supabase
    .from("event_dates")
    .select("id, candidate_date")
    .eq("event_id", event.id)
    .order("candidate_date", { ascending: true });

  if (datesError) {
    throw new Error(datesError.message);
  }

  return mapEventDetail(event, dates || []);
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

  const { data: dates, error: datesError } = await supabase
    .from("event_dates")
    .select("id, candidate_date")
    .eq("event_id", event.id)
    .order("candidate_date", { ascending: true });

  if (datesError) {
    throw new Error(datesError.message);
  }

  return mapEventDetail(event, dates || []);
}

export async function updateEvent(input: UpdateEventInput) {
  const supabase = createSupabaseServerClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .update({
      title: input.title,
      description: input.description || null,
      language: input.language,
    })
    .eq("id", input.id)
    .select("*")
    .single<EventRecord>();

  if (eventError || !event) {
    throw new Error(eventError?.message || "Failed to update event");
  }

  const { data: existingDates, error: existingDatesError } = await supabase
    .from("event_dates")
    .select("id, candidate_date")
    .eq("event_id", input.id);

  if (existingDatesError) {
    throw new Error(existingDatesError.message);
  }

  const currentDates = existingDates || [];
  const nextDateSet = new Set(input.candidateDates);

  const removedDateIds = currentDates
    .filter((item) => !nextDateSet.has(item.candidate_date))
    .map((item) => item.id);

  if (removedDateIds.length > 0) {
    const { error: responseItemsError } = await supabase
      .from("response_items")
      .delete()
      .in("event_date_id", removedDateIds);

    if (responseItemsError) {
      throw new Error(responseItemsError.message);
    }

    const { error: removeDatesError } = await supabase
      .from("event_dates")
      .delete()
      .in("id", removedDateIds);

    if (removeDatesError) {
      throw new Error(removeDatesError.message);
    }
  }

  const currentDateSet = new Set(currentDates.map((item) => item.candidate_date));
  const addedDates = input.candidateDates.filter((candidateDate) => {
    return !currentDateSet.has(candidateDate);
  });

  if (addedDates.length > 0) {
    const { error: addDatesError } = await supabase.from("event_dates").insert(
      addedDates.map((candidateDate) => ({
        event_id: input.id,
        candidate_date: candidateDate,
      })),
    );

    if (addDatesError) {
      throw new Error(addDatesError.message);
    }
  }

  return event;
}

export async function createResponse(input: CreateResponseInput) {
  const supabase = createSupabaseServerClient();

  const { data: eventDates, error: eventDatesError } = await supabase
    .from("event_dates")
    .select("id")
    .eq("event_id", input.eventId);

  if (eventDatesError) {
    throw new Error(eventDatesError.message);
  }

  const validDateIds = new Set((eventDates || []).map((item) => item.id));

  if (
    input.items.length !== validDateIds.size ||
    input.items.some((item) => !validDateIds.has(item.eventDateId))
  ) {
    throw new Error("All event dates must be answered");
  }

  const { data: response, error: responseError } = await supabase
    .from("responses")
    .insert({
      event_id: input.eventId,
      name: input.name,
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

  const results: EventDateResult[] = event.candidateDates.map((date) => {
    const items = responseItems.filter((item) => item.event_date_id === date.id);

    const availableCount = items.filter((item) => item.status === "available").length;
    const maybeCount = items.filter((item) => item.status === "maybe").length;
    const unavailableCount = items.filter(
      (item) => item.status === "unavailable",
    ).length;

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

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.availableCount !== a.availableCount) {
      return b.availableCount - a.availableCount;
    }

    return new Date(a.candidateDate).getTime() - new Date(b.candidateDate).getTime();
  });

  return {
    event: {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      language: event.language,
    },
    bestCandidate: results[0] || null,
    results,
    totalResponses: responses?.length || 0,
  };
}
