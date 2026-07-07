export default function FunFact({ fact }: { fact: string }) {
  return (
    <div className="flex justify-center px-5 pb-10 pt-6 sm:px-8">
      <div className="relative max-w-xl -rotate-1 bg-[#FAE9A0] p-5 pt-6 shadow-note">
        {/* tape strip */}
        <div
          className="absolute -top-2.5 left-1/2 h-5 w-24 -translate-x-1/2 rotate-2 bg-paper/70 shadow-sm backdrop-blur-[1px]"
          aria-hidden
        />
        <p className="font-hand text-xl font-bold text-spice-dark">
          Fun Fact ✶
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink/80">{fact}</p>
      </div>
    </div>
  )
}
