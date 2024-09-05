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

const SHOWLIST_COMMAND = {
  name: 'show',
  description: 'Show all lists created',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const CREATELIST_COMMAND = {
  name: 'create',
  description: 'Show all lists created',
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

const ALL_COMMANDS = [TEST_COMMAND, LOVE_COMMAND, CREATELIST_COMMAND, REMOVELIST_COMMAND, ADDTOLIST_COMMAND, SHOWLIST_COMMAND, CHALLENGE_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);