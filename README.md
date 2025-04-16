# Qin the Xiao

> **Qin the Xiao** is a private Discord bot, named after the creator's beloved fat cat.

## Features:

### Custom List Management

- Create a list with `/create <name>`.
- Add items to a list with `/add_to_list <item> <list>`.
- Draw a random item from a list using `/draw <list>`.

### Voice Channel Statistics

- Automatically records logs of voice channel activity.
- Set the output channel for logs using `/set_log_channel <channel>`.
- Use `/export <@user>` to export a user's voice channel statistics as a JSON file.
- Adjust the bot's time zone using `/add_time_zone <int>`. Default time zone is GMT +8.

### Speech-to-Text

- Automatically detects voice messages in text channels and transcribes them into Chinese.

### ChatBot

- Chat with the bot by mentioning it in a guild or private message (PM).
- Clear chat history with `/chat_clear`.

### Stable Diffusion Image Generation

- Generate a 1024x1024 image with a given prompt using `g!prompt`.
- Use `/gen` for advanced options and `/models` to view the list of available models.

### YouTube Music Player

The bot can play YouTube music based on the given URL or song/playlist name.

> **Command List:**
> 
> - `y!play <URL/Song Name>`: Play a song or add it to the queue.
> 
> - `y!playnext <URL/Song Name>`: Add a song as the next track to play.
> 
> - `y!shuffleplay <Playlist URL>`: Shuffle a playlist and add it to the queue.
> 
> - `y!pause`: Pause the currently playing song.
> 
> - `y!resume`: Resume the paused song.
> 
> - `y!stop`: Stop the music and delete the current playing queue.
> 
> - `y!queue`: Check the current music queue.
> 
> - `y!shuffle`: Shuffle the songs in the queue.
> 
> - `y!wind <seconds>`: Wind forward the current track by a specified number of seconds.
> 
> - `y!rewind <seconds>`: Rewind the current track by a specified number of seconds.
> 
> - `y!set <MM:SS>`: set to a specific time in the current track.

---

### Installation

1. Clone the bot's repository or download the source code.
2. Install dependencies using `npm install`.
3. Configure the bot's token and other settings in `.env`.
4. Run the bot with `node index.js`.

---

### License

This bot is private and proprietary. Redistribution or commercial use is prohibited.