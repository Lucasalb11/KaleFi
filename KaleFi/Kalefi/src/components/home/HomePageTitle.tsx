import type { FC } from 'react'
import 'twin.macro'

export const HomePageTitle: FC = () => {
  const title = 'KaleFi'
  const desc = 'Collateralized lending powered by Stellar Soroban'

  return (
    <div tw="flex flex-col items-center text-center font-mono">
      {/* Título principal */}
      <h1 tw="font-black text-white text-[3rem]">{title}</h1>

      {/* Descrição */}
      <p tw="mt-3 text-gray-400 text-base">{desc}</p>

      {/* Créditos com links */}
      <p tw="mt-2 text-gray-500 text-sm">
        Built by{' '}
        <a
          href="https://github.com/Lucasalb11"
          target="_blank"
          tw="font-semibold text-gray-400 hover:text-white"
        >
          Lucas Almeida (GitHub)
        </a>{' '}
        ·{' '}
        <a
          href="https://www.linkedin.com/in/lucasalb11/"
          target="_blank"
          tw="font-semibold text-gray-400 hover:text-white"
        >
          LinkedIn
        </a>
      </p>

      {/* Divisor */}
      <div tw="my-14 w-14 bg-gray-800 h-[2px]" />
    </div>
  )
}
