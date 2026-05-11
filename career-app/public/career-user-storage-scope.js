;(function () {
  var SCOPED_UID_KEY = 'career_scoped_supabase_uid'
  var KEYS = [
    'career_compare_board_v1',
    'career_tracking_board_v1',
    'career_compare_trash_v1',
    'career_resume_v1',
    'career_resume_history_v1',
    'career_resume_selection_v1',
    'career_step1_career_goal_v1',
    'career_last_page',
    'career_p2_session_v1',
    'career_resume_content_gen_v1',
    'current_jd_text',
    'current_job_id',
    'current_job_title',
    'career_step3_ready_v1',
    'career_p3_last_generated_v1',
    'career_p3_structured_payload_v1',
  ]

  function clearCareerKeys() {
    try {
      for (var i = 0; i < KEYS.length; i++) localStorage.removeItem(KEYS[i])
      localStorage.removeItem(SCOPED_UID_KEY)
    } catch (e) {}
  }

  window.__careerEnsureStorageUserScope = async function () {
    if (typeof localStorage === 'undefined') return
    try {
      if (window.location && window.location.protocol === 'file:') return
    } catch (e) {}
    var prev = ''
    try {
      prev = (localStorage.getItem(SCOPED_UID_KEY) || '').trim()
    } catch (e) {}
    var uid = ''
    try {
      var res = await fetch('/api/auth/session-user', {
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (!res.ok) return
      var j = await res.json()
      uid = j && j.userId ? String(j.userId).trim() : ''
      if (!uid) return
      if (prev && prev !== uid) clearCareerKeys()
      try {
        localStorage.setItem(SCOPED_UID_KEY, uid)
      } catch (e2) {}
    } catch (e3) {}
  }
})()
