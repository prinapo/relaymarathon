import { computed, ref } from 'vue'

const selectedTeamId = ref('')
const selectedPublicRaceId = ref('')

const getTeamStorageKey = (userId) => `selectedTeam:${userId || 'guest'}`
const publicRaceStorageKey = 'selectedPublicRace'

const loadSelectedTeamId = (userId) => {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(getTeamStorageKey(userId)) || ''
}

const saveSelectedTeamId = (userId, teamId) => {
  if (typeof localStorage === 'undefined') return

  if (teamId) {
    localStorage.setItem(getTeamStorageKey(userId), teamId)
  } else {
    localStorage.removeItem(getTeamStorageKey(userId))
  }
}

const loadSelectedPublicRaceId = () => {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(publicRaceStorageKey) || ''
}

const saveSelectedPublicRaceId = (raceId) => {
  if (typeof localStorage === 'undefined') return

  if (raceId) {
    localStorage.setItem(publicRaceStorageKey, raceId)
  } else {
    localStorage.removeItem(publicRaceStorageKey)
  }
}

export function useTeamContext() {
  const syncSelectedTeam = (userId, teams = []) => {
    const teamIds = teams.map(team => team.id)
    const savedTeamId = loadSelectedTeamId(userId)

    if (selectedTeamId.value && teamIds.includes(selectedTeamId.value)) {
      saveSelectedTeamId(userId, selectedTeamId.value)
      return
    }

    if (savedTeamId && teamIds.includes(savedTeamId)) {
      selectedTeamId.value = savedTeamId
      return
    }

    selectedTeamId.value = teamIds[0] || ''
    saveSelectedTeamId(userId, selectedTeamId.value)
  }

  const setSelectedTeam = (userId, teamId) => {
    selectedTeamId.value = teamId || ''
    saveSelectedTeamId(userId, selectedTeamId.value)
  }

  const syncSelectedPublicRace = (races = [], fallbackRaceId = '') => {
    const raceIds = races.map(race => race.id)
    const savedRaceId = loadSelectedPublicRaceId()

    if (selectedPublicRaceId.value && raceIds.includes(selectedPublicRaceId.value)) {
      saveSelectedPublicRaceId(selectedPublicRaceId.value)
      return
    }

    if (savedRaceId && raceIds.includes(savedRaceId)) {
      selectedPublicRaceId.value = savedRaceId
      return
    }

    selectedPublicRaceId.value = fallbackRaceId || raceIds[0] || ''
    saveSelectedPublicRaceId(selectedPublicRaceId.value)
  }

  const setSelectedPublicRace = (raceId) => {
    selectedPublicRaceId.value = raceId || ''
    saveSelectedPublicRaceId(selectedPublicRaceId.value)
  }

  return {
    selectedTeamId: computed(() => selectedTeamId.value),
    selectedPublicRaceId: computed(() => selectedPublicRaceId.value),
    syncSelectedTeam,
    setSelectedTeam,
    syncSelectedPublicRace,
    setSelectedPublicRace
  }
}
