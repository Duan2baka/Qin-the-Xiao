import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};
const LOVE_COMMAND = {
  name: 'love',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const SHOWLISTITEM_COMMAND = {
  name: 'show',
  description: 'Show all entries in a list',
  options: [
    {
      type: 3,
      name: 'list',
      description: 'Select a list',
      required: true
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const SHOWLIST_COMMAND = {
  name: 'showlists',
  description: 'Show all lists created',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const CREATELIST_COMMAND = {
  name: 'create',
  description: 'Create a list',
  options: [
    {
      type: 3,
      name: 'name',
      description: 'Name your list',
      required: true
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ADDTOLIST_COMMAND = {
  name: 'add_to_list',
  description: 'Add an entry to your list',
  options: [
    {
      type: 3,
      name: 'entry',
      description: 'Entry name',
      required: true
    },
    {
      type: 3,
      name: 'list',
      description: 'List name',
      required: true
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const REMOVELIST_COMMAND = {
  name: 'remove',
  description: 'Remove a list',
  options: [
    {
      type: 3,
      name: 'name',
      description: 'Name your list',
      required: true
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const REMOVEFROMLIST_COMMAND = {
  name: 'remove_from_list',
  description: 'Remove an entry from a list',
  options: [
    {
      type: 3,
      name: 'entry',
      description: 'Entry name',
      required: true
    },
    {
      type: 3,
      name: 'list',
      description: 'List name',
      required: true
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const DRAWFROMLIST_COMMAND = {
  name: 'draw',
  description: 'Randomly draw one entry from a list',
  options: [
    {
      type: 3,
      name: 'list',
      description: 'Select your list',
      required: true
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const roll_COMMAND = {
  name: 'roll',
  description: 'Roll a dice!',
  type: 1,
  options: [
    {
      type: 4,
      name: 'faces',
      description: 'roll a dice with specified faces',
      required: true
    },
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};
const d6_COMMAND = {
  name: 'd6',
  description: 'd6',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [TEST_COMMAND, LOVE_COMMAND, CREATELIST_COMMAND, REMOVELIST_COMMAND, ADDTOLIST_COMMAND, DRAWFROMLIST_COMMAND
  , SHOWLIST_COMMAND, REMOVEFROMLIST_COMMAND, CHALLENGE_COMMAND, SHOWLISTITEM_COMMAND,roll_COMMAND,d6_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);