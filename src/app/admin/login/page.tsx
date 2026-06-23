import { Metadata } from "next";

import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "管理者ログイン | 集丸くん",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="page-shell flex-1">
      <div className="mx-auto flex min-h-svh w-full max-w-md items-center px-4 py-8">
        <Card className="w-full space-y-5 p-6 sm:p-7">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary">管理者</p>
            <h1 className="text-3xl font-extrabold">ログイン</h1>
            <p className="text-sm leading-6 text-foreground/65">
              管理画面に入るには、設定済みの管理者メールアドレスとパスワードが必要です。
            </p>
          </div>

          <form action="/api/admin/login" method="post" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">メールアドレス</label>
              <input
                name="email"
                type="email"
                required
                className="h-12 w-full rounded-[22px] border bg-white px-4 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">パスワード</label>
              <input
                name="password"
                type="password"
                required
                className="h-12 w-full rounded-[22px] border bg-white px-4 text-sm"
              />
            </div>

            {error ? (
              <p className="rounded-[18px] bg-[#fff5f4] px-4 py-3 text-sm font-semibold text-danger">
                ログイン情報が正しくありません。
              </p>
            ) : null}

            <button className="inline-flex h-14 w-full items-center justify-center rounded-[22px] bg-primary px-6 text-base font-semibold text-white">
              ログイン
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}
