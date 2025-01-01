import React, { useState } from 'react'
import type { GameWithLocalData, LocalData } from '@/types'
import { useNavigate, useParams } from 'react-router-dom'
import { useSharedState } from '@/store'
import { DefaultButton, PrimaryButton, Stack, TextField } from '@fluentui/react'

export const Edit = () => {
  const { id } = useParams()
  const games = useSharedState((state) => state.getAllData)()
  const game = games.find((game) => game.id.toString() === id)

  if (!game) {
    return <div>游戏不存在</div>
  }

  const navigate = useNavigate()
  const updateData = useSharedState((state) => state.updateData)
  const [editedGame, setEditedGame] = useState(game)

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

  const handleSave = (updatedGame: GameWithLocalData) => {
    updateData(updatedGame)
    navigate(-1)
  }

  return (
    <React.Fragment>
      <h2 className="text-2xl font-semibold">{game.title}</h2>
      <div className="overflow-auto px-4">
        <Stack tokens={{ childrenGap: 16 }}>
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">标题</h3>
            <TextField value={editedGame.title} onChange={(_, value) => updateField('title', value || '')} required />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">别名</h3>
            <TextField
              value={editedGame.alias.join(', ')}
              onChange={(_, value) =>
                updateField(
                  'alias',
                  (value || '').split(',').map((v) => v.trim())
                )
              }
              placeholder="用逗号分隔多个别名"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">开发者</h3>
            <TextField value={editedGame.developer} onChange={(_, value) => updateField('developer', value || '')} />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">描述</h3>
            <TextField
              value={editedGame.description}
              multiline
              rows={3}
              onChange={(_, value) => updateField('description', value || '')}
              styles={{ root: { width: 400 } }}
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">标签</h3>
            <TextField
              value={editedGame.tags.join(', ')}
              onChange={(_, value) =>
                updateField(
                  'tags',
                  (value || '').split(',').map((v) => v.trim())
                )
              }
              placeholder="用逗号分隔多个标签"
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">封面 URL</h3>
            <TextField value={editedGame.cover} onChange={(_, value) => updateField('cover', value || '')} />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">预计时长</h3>
            <TextField
              type="number"
              value={editedGame.expectedPlayMinutes.toString()}
              onChange={(_, value) => updateField('expectedPlayMinutes', Number.parseInt(value || '0', 10))}
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">评分</h3>
            <TextField
              type="number"
              value={editedGame.rating.toString()}
              onChange={(_, value) => updateField('rating', Number.parseFloat(value || '0'))}
            />
          </Stack>

          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <h3 className="font-semibold">发行日期</h3>
            <TextField
              type="date"
              value={new Date(editedGame.releaseDate).toISOString().split('T')[0]}
              onChange={(_, value) => updateField('releaseDate', new Date(value || '').getTime())}
            />
          </Stack>
        </Stack>

        {editedGame.local && (
          <Stack tokens={{ childrenGap: 16 }} className="mt-6">
            <h2 className="text-lg font-semibold mb-4">本地设置</h2>
            <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
              <h3 className="font-semibold">存档路径</h3>
              <TextField
                value={editedGame.local.savePath}
                onChange={(_, value) => updateLocalDataField('savePath', value || '')}
              />
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
              <h3 className="font-semibold">启动程序</h3>
              <TextField
                value={editedGame.local.programFile}
                onChange={(_, value) => updateLocalDataField('programFile', value || '')}
              />
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
              <h3 className="font-semibold">攻略文件</h3>
              <TextField
                value={editedGame.local.guideFile}
                onChange={(_, value) => updateLocalDataField('guideFile', value || '')}
              />
            </Stack>
          </Stack>
        )}

        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-6">
          <DefaultButton text="取消" onClick={() => navigate(-1)} />
          <PrimaryButton text="保存" onClick={() => handleSave(editedGame)} />
        </Stack>
      </div>
    </React.Fragment>
  )
}
