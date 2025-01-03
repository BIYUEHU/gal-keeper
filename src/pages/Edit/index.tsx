import React, { useState } from 'react'
import type { FetchMethods, GameWithLocalData, LocalData } from '@/types'
import { useNavigate, useParams } from 'react-router-dom'
import useStore, { useSharedStore } from '@/store'
import { DefaultButton, PrimaryButton, Stack, TextField } from '@fluentui/react'
import { open } from '@tauri-apps/plugin-dialog'
import { Dropdown } from '@fluentui/react/lib/Dropdown'
import { Spinner } from '@fluentui/react-components'
import { fetchGameData } from '@/api'
import { IS_TAURI } from '@/constant'
import { cacheImage } from '@/utils'

const dropdownOptions: { key: FetchMethods; text: string }[] = [
  { key: 'mixed', text: '聚合搜索' },
  { key: 'vndb', text: 'VNDB' },
  { key: 'bgm', text: 'Bangumi' }
]

export const Edit = () => {
  const { id } = useParams()
  const game = useSharedStore((state) => state.getData)(id ?? '')

  if (!game) {
    return <div>游戏不存在</div>
  }

  const { getSettingsField } = useStore((state) => state)
  const [fetchMethod, setFetchMethod] = useState<FetchMethods>(getSettingsField('fetchMethods'))
  const navigate = useNavigate()
  const updateData = useSharedStore((state) => state.updateData)
  const [editedGame, setEditedGame] = useState(game)

  const [isLoading, setIsLoading] = useState(false)
  const { openFullLoading } = useStore((state) => state)

  const updateField = <T extends Exclude<keyof GameWithLocalData, 'id' | 'local'>>(
    key: T,
    value: GameWithLocalData[T]
  ) => {
    setEditedGame({
      ...editedGame,
      [key]: value
    } as GameWithLocalData)
  }

  const updateLocalDataField = <T extends keyof LocalData>(key: T, value: LocalData[T]) => {
    setEditedGame({
      ...editedGame,
      local: {
        ...editedGame.local,
        [key]: value
      }
    } as GameWithLocalData)
  }

  const handleSave = async (data: GameWithLocalData) => {
    const close = openFullLoading()
    updateData({
      ...data,
      ...{
        cover:
          data.cover && IS_TAURI && getSettingsField('autoCacheGameCover')
            ? await cacheImage(data.cover).finally(close)
            : data.cover
      }
    })
    navigate(-1)
  }

  const handleFetchData = async () => {
    setIsLoading(true)
    const fetchData = await fetchGameData(fetchMethod, editedGame.title)
    setEditedGame({
      ...editedGame,
      ...fetchData,
      ...{ title: fetchData && getSettingsField('autoSetGameTitle') ? fetchData.title : editedGame.title }
    })
    setIsLoading(false)
  }

  const handleSelectSavePath = async () => {
    const savePath = await open({
      title: '选择存档目录',
      directory: true,
      multiple: false,
      canCreateDirectories: true
    })
    if (savePath) updateLocalDataField('savePath', savePath)
  }

  const handleSelectProgramFile = async () => {
    const programFile = await open({
      title: '选择启动程序',
      directory: false,
      canCreateDirectories: false,
      multiple: false,
      filters: [{ name: '可执行文件', extensions: ['exe'] }]
    })
    if (programFile) updateLocalDataField('programFile', programFile)
  }

  const handleSelectGuideFile = async () => {
    const guideFile = await open({
      title: '选择攻略文件',
      directory: false,
      canCreateDirectories: false,
      multiple: false,
      filters: [
        {
          name: '文本文件',
          extensions: ['txt', 'md', 'html', 'htm', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
        }
      ]
    })
    if (guideFile) updateLocalDataField('guideFile', guideFile)
  }

  return (
    <React.Fragment>
      <h2 className="text-2xl font-semibold">{game.title}</h2>
      <div className="overflow-auto px-4 children:children:children:my-1">
        <Stack tokens={{ childrenGap: 8 }}>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h2 className="text-lg font-semibold">基本信息</h2>
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">数据源</h3>
            <Dropdown
              options={dropdownOptions}
              selectedKey={fetchMethod}
              className="w-25"
              onChange={(_, option) => setFetchMethod(option?.key as FetchMethods)}
            />
            <DefaultButton text="从数据源更新数据" onClick={handleFetchData} />
            {isLoading && <Spinner />}
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">游戏名</h3>
            <TextField
              value={editedGame.title}
              onChange={(_, value) => updateField('title', value || '')}
              required
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">开发者</h3>
            <TextField
              value={editedGame.developer}
              onChange={(_, value) => updateField('developer', value || '')}
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">简介</h3>
            <TextField
              value={editedGame.description}
              multiline
              rows={14}
              onChange={(_, value) => updateField('description', value || '')}
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-9">标签</h3>
            <TextField
              value={editedGame.tags.join(', ')}
              onChange={(_, value) =>
                updateField(
                  'tags',
                  (value || '').split(',').map((v) => v.trim())
                )
              }
              placeholder="用逗号分隔多个标签"
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold w-13">封面图</h3>
            <TextField
              value={editedGame.cover}
              onChange={(_, value) => updateField('cover', value || '')}
              className="flex-grow-1"
              autoComplete="off"
            />
          </Stack>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stack horizontal tokens={{ childrenGap: 5 }} verticalAlign="center">
              <h3 className="font-semibold w-22">预计时长</h3>
              <TextField
                type="number"
                value={editedGame.expectedPlayHours.toString()}
                onChange={(_, value) => updateField('expectedPlayHours', Number(value ?? '0'))}
                className="flex-grow-1"
                autoComplete="off"
              />
            </Stack>

            <Stack horizontal tokens={{ childrenGap: 5 }} verticalAlign="center">
              <h3 className="font-semibold w-9">评分</h3>
              <TextField
                type="number"
                value={editedGame.rating.toString()}
                onChange={(_, value) => updateField('rating', Number(value ?? '0'))}
                className="flex-grow-1"
                autoComplete="off"
              />
            </Stack>

            <Stack horizontal tokens={{ childrenGap: 6 }} verticalAlign="center">
              <h3 className="font-semibold w-22">发行日期</h3>
              <TextField
                type="date"
                value={new Date(editedGame.releaseDate).toISOString().split('T')[0]}
                onChange={(_, value) => updateField('releaseDate', new Date(value || '').getTime())}
                className="flex-grow-1"
                autoComplete="off"
              />
            </Stack>
          </div>
        </Stack>

        <Stack tokens={{ childrenGap: 8 }} className="mt-4">
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h2 className="text-lg font-semibold">本地设置</h2>
          </Stack>
          {editedGame.local ? (
            <React.Fragment>
              <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                <h3 className="font-semibold w-17">存档路径</h3>
                <TextField
                  value={editedGame.local.savePath}
                  readOnly
                  onClick={handleSelectSavePath}
                  placeholder="选择一个目录"
                  className="flex-grow-1"
                  autoComplete="off"
                />
              </Stack>
              <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                <h3 className="font-semibold w-17">启动程序</h3>
                <TextField
                  value={editedGame.local.programFile}
                  readOnly
                  onClick={handleSelectProgramFile}
                  placeholder="选择一个可执行文件"
                  className="flex-grow-1"
                  autoComplete="off"
                />
              </Stack>
              {/* TODO: Sync guide text file */}
              <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
                <h3 className="font-semibold w-17">攻略文件</h3>
                <TextField
                  value={editedGame.local.guideFile}
                  readOnly
                  onClick={handleSelectGuideFile}
                  placeholder="选择一个文本文件"
                  className="flex-grow-1"
                  autoComplete="off"
                />
              </Stack>
            </React.Fragment>
          ) : (
            <h3 className="text-red">请先同步至本地</h3>
          )}
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-6">
          <DefaultButton text="取消" onClick={() => navigate(-1)} />
          <PrimaryButton text="保存" onClick={() => handleSave(editedGame)} />
        </Stack>
      </div>
    </React.Fragment>
  )
}
