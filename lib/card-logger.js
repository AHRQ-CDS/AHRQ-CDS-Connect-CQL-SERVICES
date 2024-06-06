const path = require('path');
const fs = require('fs/promises');

/* eslint-disable no-console */

async function checkCardLoggingSetting() {
  const setting = (process.env.CARD_LOGGING || 'off').trim();
  if (/^(off|console)$/i.test(setting)) {
    return setting;
  } else if (/^file:.+/i.test(setting)) {
    const folder = getFolderFromSetting(setting);
    return fs.stat(folder).then(stat => {
      if (!stat.isDirectory()) {
        throw new Error(); // caught directly below
      }
      return fs.access(folder, fs.constants.W_OK).then(() => `file:${folder}`);
    })
      .catch(() => {
        throw new Error(`CARD_LOGGING value '${setting}' (${folder}) does not represent a valid writable folder`);
      });
  }
  // If we got here, CARD_LOGGING is not the right format
  throw new Error(`Unrecognized CARD_LOGGING value '${setting}'. Value must be 'file:/path/to/folder', 'console', or 'off'`);
}

async function logCard(hookId, card) {
  const setting = (process.env.CARD_LOGGING || 'off').trim();
  if (/^off$/i.test(setting)) {
    return;
  } else if (/^console$/i.test(process.env.CARD_LOGGING)) {
    console.log(new Date().toISOString(), `Card sent for ${hookId}:\n${JSON.stringify(card, null, 2)}`);
  } else if (/^file:.+/i.test(setting)) {
    const folder = getFolderFromSetting(setting);
    try {
      await writeTimestampedJSON(folder, `${hookId}-${card.uuid}-card`, card);
    } catch (e) {
      console.error(new Date().toISOString(), `ERROR: Failed to write card file for hook ${hookId} card ${card.uuid}`);
      throw e;
    }
  }
}

async function logFeedback(hookId, feedback) {
  const setting = (process.env.CARD_LOGGING || 'off').trim();
  if (/^off$/i.test(setting)) {
    return;
  } else if (/^console$/i.test(process.env.CARD_LOGGING)) {
    console.log(new Date().toISOString(), `Feedback received for ${hookId}:\n${JSON.stringify(feedback, null, 2)}`);
  } else if (/^file:.+/i.test(setting)) {
    const folder = getFolderFromSetting(setting);
    try {
      await writeTimestampedJSON(folder, `${hookId}-${feedback.card}-feedback`, feedback);
    } catch (e) {
      console.error(new Date().toISOString(), `ERROR: Failed to write feedback file for hook ${hookId} card ${feedback.card}`);
      // Rethrow the error since the service intended to store the feedback but failed
      throw e;
    }
  }
}

function getFolderFromSetting(setting) {
  if (/^file:.+/i.test(setting)) {
    const folder = setting.slice(5);
    if (path.isAbsolute(folder)) {
      return folder;
    } else {
      return path.resolve(__dirname, '..', folder);
    }
  }
}

// Function to write a file and increment the file name if the file already exists.
// Based on Stack Overflow answer: https://stackoverflow.com/a/65403443
const writeTimestampedJSON = async (folder, name, data, time = new Date(), increment = 1) => {
  const timestamp = time.toISOString().replace(/\D/g, '');
  const modifiedFilePath = path.join(folder, `${name}-${timestamp}${increment > 1 ? `-${increment}` : ''}.json`);
  return await fs.writeFile(modifiedFilePath, JSON.stringify(data, null, 2), { flag: 'wx', encoding: 'utf-8' })
    .catch(async ex => {
      if (ex.code === 'EEXIST') {
        return await writeTimestampedJSON(folder, name, data, time, increment + 1);
      } else {
        throw ex;
      }
    });
};

module.exports = {checkCardLoggingSetting, logCard, logFeedback};