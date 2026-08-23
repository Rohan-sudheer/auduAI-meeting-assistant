export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-violet-50" />
      <div className="absolute -top-48 -left-48 h-[34rem] w-[34rem] rounded-full bg-brand-300/40 blur-[130px]" />
      <div className="absolute top-1/4 -right-56 h-[38rem] w-[38rem] rounded-full bg-violet-300/35 blur-[140px]" />
      <div className="absolute bottom-[-10rem] left-1/4 h-[30rem] w-[30rem] rounded-full bg-pink-200/35 blur-[130px]" />
      <div className="absolute bottom-0 right-0 h-[26rem] w-[26rem] rounded-full bg-emerald-200/25 blur-[130px]" />
    </div>
  );
}
