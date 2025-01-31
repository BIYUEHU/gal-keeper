import I18n from '@kotori-bot/i18n'

import enUS from '@/locales/en-US'
import jaJP from '@/locales/ja-JP'
import zhCN from '@/locales/zh-CN'
import zhTW from '@/locales/zh-TW'

const i18n = new I18n()

i18n.use(jaJP, 'ja_JP')
i18n.use(enUS, 'en_US')
i18n.use(zhTW, 'zh_TW')
i18n.use(zhCN, 'zh_CN')

i18n.set('ja_JP')

export const t = i18n.t.bind(i18n)

export const f =
  (raw: TemplateStringsArray) =>
  (...params: string[]) =>
    Array.from(params.entries()).reduce(
      (result, [index, value]) => result.replaceAll(`{${index}}`, value),
      i18n.locale(raw.join(''))
    )

export default i18n
