// @see https://snyk.io/advisor/npm-package/@devicefarmer/adbkit
import adbkit from '@devicefarmer/adbkit'
import pLimit from 'p-limit'
import pThrottle from 'p-throttle';
import dayjs from 'dayjs'

import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const InputEvent = require('input-event')

const input = new InputEvent('/dev/input/event9')
const mouse = new InputEvent.Mouse(input)

const client = adbkit.Adb.createClient()
const devices = await client.listDevices()
const device = client.getDevice(devices.at(0).id)


const limit = pLimit(1)
const throttle = pThrottle({
  limit: 1,
  interval: 50
})

let lock = false
let i = 0
let timer = null

const commit = async () => {
  let num = 50 * i
  i = 0
  lock = true
  timer = setTimeout(() => {
    lock = false
  }, 400)

  console.log(dayjs().format())
  return await device.shell(`input swipe 400 400 400 ${400 + num}`)
}

const up = () => {
  if (i < 0) {
    i = 0
    i = i + 2
    clearTimeout(timer)
    limit(() => commit())
  }

  i = Math.min(i + 1, 5)
}

const down = () => {
  if (i > 0) {
    i = 0;
    i = i - 2
    clearTimeout(timer)
    limit(() => commit())
  }

  i = Math.max(i - 1, -5)
}

const onWheel = ({ value }) => {
  value === 1 ? up() : down()

  if (!lock) {
    limit(() => commit()
    )
  }
}

mouse.on('wheel', onWheel)


