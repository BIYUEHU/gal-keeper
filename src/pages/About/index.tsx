import { useEffect, useState } from 'react'
import { Stack, Text, Link, DefaultButton, Separator } from '@fluentui/react'
import { random } from '@kotori-bot/tools'
import { openUrl } from '@/utils'
import { version, author, description } from '@/../package.json'
import axios from 'axios'
import { t } from '@/utils/i18n'

interface Log {
  version: string
  date: string
  types: {
    type: string
    commits: {
      message: string
      hash: string
      url: string
    }[]
  }[]
}

function parseChangelog(text: string) {
  const logs: Log[] = []
  let currentLog: Log | null = null

  text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const versionMatch = line.match(/^# \[(\d+\.\d+\.\d+)\](.+) \((.+)\)$/)
      const typeMatch = line.match(/^### (.+)$/)
      const commitMatch = line.match(/^\* (.+) \(\[(.+)\]\((.+)\)\)$/)

      if (versionMatch) {
        currentLog = { version: versionMatch[1], date: versionMatch[3], types: [] }
        logs.push(currentLog)
      } else if (typeMatch) {
        currentLog?.types.push({ type: typeMatch[1], commits: [] })
      } else if (commitMatch) {
        currentLog?.types[currentLog.types.length - 1].commits.push({
          message: commitMatch[1],
          hash: commitMatch[2],
          url: commitMatch[3]
        })
      }
    })

  return logs
}

const About: React.FC = () => {
  const [changelog, setChangelog] = useState<Log[] | null>([])

  useEffect(() => {
    axios
      .get('https://raw.githubusercontent.com/biyuehu/gal-keeper/main/CHANGELOG.md')
      .then((res) => setChangelog(parseChangelog(res.data)))
      .catch(() => setChangelog(null))
  }, [])

  return (
    <div className="overflow-auto p-4">
      <Stack className="h-75vh flex flex-col justify-center items-center my-auto px-7">
        <img
          onClick={() => openUrl('https://vndb.org/c18258')}
          src="/assets/cover.png"
          alt="logo"
          className="w-48 h-48 mb-4 hover:cursor-pointer"
        />
        <h1 className="text-red-300">Nanno | GalKeeper</h1>
        <strong className="text-gray-800 text-lg">{description}</strong>
        <div className="mt-4">
          {[
            ['GitHub', 'https://github.com/biyuehu/gal-keeper', 'text-red-300'],
            ['Bilibili', 'https://space.bilibili.com/293767574', 'text-pink'],
            ['QQ Group', 'https://qm.qq.com/q/JCRGJIpzk2', 'text-blue-500']
          ].map(([text, url, color]) => (
            <DefaultButton text={text} key={text} onClick={() => openUrl(url)} className={`mr-2 ${color}`} />
          ))}
        </div>
        <span className="mt-4 text-gray-500">
          By {author.slice(0, author.lastIndexOf(' '))} with {random.choice(['❤️', '💴', '🩸'])}| Licensed under BCU |
          Version {version}
        </span>
      </Stack>

      <Separator />
      <Stack horizontal className="my-4">
        <Text variant="xLarge" className="block mb-4">
          {t`page.about.changelog`}
        </Text>

        <Stack tokens={{ childrenGap: 20 }}>
          <br />
          {changelog ? (
            changelog.length === 0 ? (
              <Text variant="large">{t`page.about.changelog.loading`}</Text>
            ) : (
              changelog.map((log) => (
                <div key={log.version}>
                  <Text variant="xLarge" className="font-bold">
                    {log.version} ({log.date})
                  </Text>
                  {log.types.map((type) => (
                    <div key={type.type} className="mt-4">
                      <Text variant="large" className="font-semibold">
                        {type.type}
                      </Text>
                      <ul className="ml-4 mt-2 list-disc">
                        {type.commits.map((commit) => (
                          <li key={commit.hash}>
                            <Text variant="large">{commit.message} </Text>
                            <Link href={commit.url} target="_blank">
                              [{commit.hash}]
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))
            )
          ) : (
            <Text variant="large" className="text-red-500">{t`page.about.changelog.failed`}</Text>
          )}
        </Stack>
      </Stack>
    </div>
  )
}

export default About
