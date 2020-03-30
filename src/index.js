import './main.css'

const MS_PER_DAY = 86400000
const GOOGLE_ANALYTICS_DELAY_MS = 30

const EARTH_DAY_LIVE_URLS = {
  en: 'https://www.earthdaylive2020.org/?source=earthdaylivebanner',
  // es: 'https://es.globalclimatestrike.net/?source=digitalstrikebanner',
  // de: 'https://de.globalclimatestrike.net/?source=digitalstrikebanner',
  // cs: 'https://www.tydenproklima.cz',
  // fr: 'https://fr.globalclimatestrike.net/?source=digitalstrikebanner',
  // nl: 'https://globalclimatestrike.net/?source=digitalstrikebanner',
  // tr: 'https://sifirgelecek.org/',
  // pt: 'https://pt.globalclimatestrike.net/?source=digitalstrikebanner',
  // it: 'https://digital.globalclimatestrike.net/join/?source=digitalstrikebanner',
}

const EARTH_DAY_LIVE_FULL_PAGE_URLS = {
  en: 'https://www.earthdaylive2020.org/?source=earthdaylivebanner',
  // es: 'https://es.globalclimatestrike.net/digital-strike-day/?source=digitalstrikebanner',
  // de: 'https://de.globalclimatestrike.net/digital-strike-day/?source=digitalstrikebanner',
  // cs: 'https://www.tydenproklima.cz',
  // fr: 'https://fr.globalclimatestrike.net/digital-strike-day/?source=digitalstrikebanner',
  // nl: 'https://globalclimatestrike.net/digital-strike-day/?source=digitalstrikebanner',
  // tr: 'https://sifirgelecek.org',
  // pt: 'https://pt.globalclimatestrike.net/digital-strike-day/?source=digitalstrikebanner',
  // it: 'https://globalclimatestrike.net/digital-strike-day/?source=digitalstrikebanner',
}

const LOCALE_CODE_MAPPING = {
  en: 'en-EN',
  de: 'de-DE',
  es: 'es-ES',
  cs: 'cs-CZ',
  fr: 'fr-FR',
  nl: 'nl-NL',
  tr: 'tr-TR',
  pt: 'pt-BR',
  it: 'it-IT',
}

let joinUrls = null
let isMaximizing = false
let language = 'en'

function maximize() {
  if (isMaximizing) return
  isMaximizing = true
  postMessage('maximize')
  const stickyFooter = document.querySelector('.edl-footer')
  stickyFooter.style.display = 'none'

  const fullPage = document.querySelector('.edl-full-page')
  fullPage.style.display = 'flex'
}

function showCloseButtonOnFullPageWidget() {
  const fullPageWidget = document.querySelector('.edl-full-page')
  fullPageWidget.style.background = 'none'
  fullPageWidget.classList.add('show-close-button')

  const fullPageCloseButton = document.querySelector('.edl-full-page__close')
  fullPageCloseButton.style.display = 'flex'

  const fullPageCloseButtonContent = document.querySelector('.edl-close')
  fullPageCloseButtonContent.classList.add('edl-full-page-close')

  const fullPageFooter = document.querySelector('.edl-full-page__footer')
  fullPageFooter.style.display = 'none'
}

function isTruthy(str) {
  return typeof(str) === 'undefined' || `${str}` === 'true' || `${str}` === '1'
}

function parseQuery(queryString) {
  var query = {}
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

function postMessage(action, data) {
  data || (data = {})
  data.action = action
  data.EARTH_DAY_LIVE = true
  window.parent.postMessage(data, '*')
}

function handleCloseButtonClick(event) {
  event.preventDefault()
  event.stopPropagation()

  //adding delay to allow google analytics call to complete
  setTimeout(() => {
    postMessage('closeButtonClicked')
  }, GOOGLE_ANALYTICS_DELAY_MS)
}

function handleJoinEDLButtonClick(event) {
  event.preventDefault()
  event.stopPropagation()

  //adding delay to allow google analytics call to complete
  setTimeout(() => {
    postMessage('buttonClicked', { linkUrl: joinUrls[language] })
  }, GOOGLE_ANALYTICS_DELAY_MS)
}

function setEarthDayLiveLinkUrl(selector) {
  const element = document.querySelector(selector)
  element.setAttribute('href', joinUrls[language])
}

function attachEvent(selector, event, callback) {
  var elements = document.querySelectorAll(selector)
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener(event, callback)
  }
}

function initGoogleAnalytics() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga')

  if (typeof window.ga !== 'undefined') {
    window.ga('create', 'UA-145982710-1', 'auto')
    window.ga('send', 'pageview')
  }
}

function addTrackingEvents(hostname, forceFullPageWidget) {
  attachEvent('.edl-footer .edl-link', 'click', () => trackEvent('footer-join-button', 'click', hostname))
  attachEvent('.edl-footer .edl-close', 'click', () => trackEvent('footer-close-button', 'click', hostname))
  attachEvent('.edl-full-page .edl-link', 'click', () => trackEvent('full-page-join-button', 'click', hostname))
  attachEvent('.edl-full-page .edl-close', 'click', () => trackEvent('full-page-close-button', 'click', hostname))

  if (forceFullPageWidget) {
    trackEvent('full-page-widget', 'load', hostname)
  } else {
    trackEvent('footer-widget', 'load', hostname)
  }
}

function trackEvent(category, action, label, value) {
  if (!window.ga) return

  const params = {
    hitType: 'event',
    eventCategory: category,
    eventAction: action
  }

  if (label) {
    params.eventLabel = label
  }

  if (value) {
    params.eventValue = value
  }
  window.ga('send', params)
}

function todayIs(date) {
  var today = new Date()
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate()
}

function getFormattedDate(date, language) {
  return date.toLocaleDateString(LOCALE_CODE_MAPPING[language], { day: 'numeric', month: 'long' })
}

function initializeInterface() {
  const query = parseQuery(location.search)
  const fullPageDisplayStartDate = new Date(Date.parse(query.fullPageDisplayStartDate))
  const fullPageDisplayStopDate = new Date(fullPageDisplayStartDate.getTime() + MS_PER_DAY)
  const isFullPage = query.forceFullPageWidget || todayIs(fullPageDisplayStartDate)

  joinUrls = isFullPage ? EARTH_DAY_LIVE_FULL_PAGE_URLS : EARTH_DAY_LIVE_URLS

  setEarthDayLiveLinkUrl('.edl-footer .edl-link')
  setEarthDayLiveLinkUrl('.edl-footer .edl-link__icon')
  setEarthDayLiveLinkUrl('.edl-footer__logo')
  setEarthDayLiveLinkUrl('.edl-full-page .edl-link')
  setEarthDayLiveLinkUrl('.edl-full-page .edl-link__icon')
  setEarthDayLiveLinkUrl('.edl-full-page__logo')
  attachEvent('.edl-close', 'click', handleCloseButtonClick)
  attachEvent('.edl-link', 'click', handleJoinEDLButtonClick)
  attachEvent('.edl-link__icon', 'click', handleJoinEDLButtonClick)
  attachEvent('.edl-footer__logo', 'click', handleJoinEDLButtonClick)
  attachEvent('.edl-full-page__logo', 'click', handleJoinEDLButtonClick)

  language = query.language ? query.language : language

  if (query.showCloseButtonOnFullPageWidget) {
    showCloseButtonOnFullPageWidget()
  }

  if (isTruthy(query.googleAnalytics) && !navigator.doNotTrack) {
    initGoogleAnalytics()
    addTrackingEvents(query.hostname, query.forceFullPageWidget)
  }

  if (isFullPage) {
    maximize()
  }

  // Set display dates on full-size widget
  var fullscreenDateString = getFormattedDate(fullPageDisplayStartDate, language)
  var nextDayDateString = getFormattedDate(fullPageDisplayStopDate, language)
  document.getElementById('edl-strike-date').innerText = fullscreenDateString
  document.getElementById('edl-tomorrow-date').innerText = nextDayDateString
}

document.addEventListener('DOMContentLoaded', initializeInterface)
