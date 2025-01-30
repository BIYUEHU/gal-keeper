import { useState, useEffect } from 'react'
import { Modal, PrimaryButton, DefaultButton, Stack } from '@fluentui/react'
import useStore from '@/store'
import { Checkbox } from '@fluentui/react/lib/Checkbox'
import { t } from '@/utils/i18n'
import type { Category } from '@/types'
import { Text } from '@fluentui/react/lib/Text'

interface AddGameModalProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  data: Category
  setData: (data: Category[]) => void
}

const InsertModal: React.FC<AddGameModalProps> = ({ isOpen, setIsOpen, setData, data }) => {
  const { getAllGameData, updateCategory } = useStore((state) => state)
  const games = getAllGameData(true)
  const [selectedGames, setSelectedGames] = useState(data.gameIds)

  const handleGameChange = (checked?: boolean, gameId?: string) => {
    if (!gameId) return
    if (checked) {
      setSelectedGames([...selectedGames, gameId])
    } else {
      setSelectedGames(selectedGames.filter((id) => id !== gameId))
    }
  }

  const handleInsertGames = () => {
    setIsOpen(false)
    updateCategory(data.id, selectedGames)
    setData(useStore.getState().categories)
  }

  useEffect(() => {
    if (!isOpen) setSelectedGames(data.gameIds)
  }, [isOpen, data])

  return (
    <Modal isOpen={isOpen} isBlocking={false} containerClassName="modal-container overflow-hidden">
      <div className="p-6 bg-white rounded-md shadow-md">
        <Text variant="xLarge" className="font-semibold mb-4">
          {t`component.addModal.title`}
        </Text>
        <Stack tokens={{ childrenGap: 16 }} className="mt-2 max-h-80%">
          {games.map((game) => (
            <Checkbox
              key={game.id}
              label={game.title}
              onChange={(_, checked) => handleGameChange(checked, game.id)}
              checked={selectedGames.includes(game.id)}
            />
          ))}
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }} horizontalAlign="end" className="mt-4">
          <DefaultButton onClick={() => setIsOpen(false)} text={t`component.confirmBox.button.cancel`} />
          <PrimaryButton onClick={handleInsertGames} text={t`component.confirmBox.button.confirm`} />
        </Stack>
      </div>
    </Modal>
  )
}

export default InsertModal
