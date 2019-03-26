## MMM-VoiceCommander

Control other modules that use voice commands with a single microphone.

Built in motion detection for webcams. Puts your display to sleep or wakes it up.

Built in support for sound files for audio responses.

Hide and show pages of modules.

Hide and show individual modules.

No modification of other modules necessary.

Offline by default. Online by controlling other modules. (Ex. AssistantMk2)


## Thanks go to . . .

* @sdetweil added crucial microphone release functionality to the module.
* @Mykle1's original pages and hide/show commands were improved upon and custom sound support.
* @cowboysdude for the "sentences" array and consultations on Skype.

## Inspirations

* MMM-voice by Strawberry 3.141
* motiondetector, camera by alexyak
* Hello-Lucy by Mykle1

## Installation and requirements

* `git clone https://github.com/thestigh/MMM-VoiceCommander` into the `~/MagicMirror/modules` directory.

* `cd MMM-VoiceCommander`

* `cd installers`

* `bash dependencies.sh`


## Config.js entry and options

    {
    disabled: false,
    module: "MMM-VoiceCommander",
    position: "top_center",
    config: {
      keyword: 'HELLO LUCY', // must use capital letters
      microphone: 0, // Please set correct microphone from the cat output after installation
      activateMotion: false, // true if you have a webcam and want motion detection
      standByMethod: 'DPMS', // 
      sounds: ["female_hi.wav"], // add sound files (comma separated) for random greetings
      startHideAll: true, // hides all modules at startup EXCEPT mainPageModules
          mainPageModules: ["MMM-VoiceCCommander"], // add modules in quotes and comma separated 
          pageTwoModules: [],     // add modules in quotes and comma separated 
          pageThreeModules: [],   // add modules in quotes and comma separated
          pageFourModules: [],    // add modules in quotes and comma separated
          pageFiveModules: [],    // add modules in quotes and comma separated
          pageSixModules: [],     // add modules in quotes and comma separated
          pageSevenModules: [],   // add modules in quotes and comma separated
          pageEightModules: [],   // add modules in quotes and comma separated
          pageNineModules: [],    // add modules in quotes and comma separated
          pageTenModules: [],     // add modules in quotes and comma separated
           }
    },

## Default modules and their commands

* MMM-VoiceCommander - Hello Lucy (Replace Hello Lucy with your keyword)<br>
&emsp; &emsp; &emsp; &emsp; Go Online (Must have MMM-AssistantMk2 installed)<br>
                       Activate Assistant (Must have MMM-AssistantMk2 installed)<br>
                       Show Assistant<br>
                       Hide Assistant<br>
                       Go To Sleep<br>
                       Please Wake Up<br>
                       Open help<br>
                       Close help<br>
                       Show Main Page<br>
                       Show Page Two<br>
                       Show Page Three<br>
                       Show Page Four<br>
                       Show Page Five<br>
                       Show Page Six<br>
                       Show Page Seven<br>
                       Show Page Eight<br>
                       Show Page Nine<br>
                       Show Page Ten<br>
                       Show Modules<br>
                       Hide Modules<br>
                       Show Camera<br>
                       Hide Camera<br>
                       Selfie<br>
                       
* MMM-WindyV2 - Hide/Show Wind<br>
                Zoom In<br>
                Zoom Out<br>
                Show Default Zoom<br>
                Show me wind<br>
                Show me rain<br>
                Shoe me clouds<br>
                Show me temperature<br>
                Show me pressure<br>
                Show me currents<br>
                Show me waves<br>
                Rotate Layer<br>
                Play Animation<br>
                Cancel Animation<br>
                
* MMM-AfterShip - Hide/Show Shipping
* MMM-ATM         Hide/Show Trivia
* MMM-BMW-DS      Hide/Show Weather
* MMM-CARDS       Hide/Show Cards
* MMM-Census      Hide/Show Census
* MMM-Cocktails   Hide/Show Cocktails
* MMM-EARTH       Hide/Show Earth
* MMM-EarthWinds  Hide/Show EarthWind
* MMM-EasyBack    Hide/Show Background
* MMM-EasyPix     Hide/Show Lucy 
* MMM-Events      Hide/Show Events
* MMM-EventHorizon Hide/Show Timer
* MMM-EyeCandy    Hide/Show EyeCandy
* MMM-FMI         Hide/Show Phone
* MMM-Fortune     Hide/Show Fortune
* MMM-Gas         Hide/Show Gas
* MMM-ISS         Hide/Show Station
* MMM-JEOPARDY    Hide/Show Jeopardy
* MMM-LICE        Hide/Show Lice
* MMM-Lottery     Hide/Show Lottery
* MMM-Lunartic    Hide/Show Moon
* MMM-MARS        Hide/Show Mars
* MMM-NASA        Hide/Show Nasa
* MMM-NOAA3       Hide/Show Weather
* MMM-PC-Stats    Hide/Show Stats
* MMM-PetFinder   Hide/Show Pets
* MMM-PilotWX     Hide/Show Pilots
* MMM-SORT        Hide/Show Tides
* MMM-SoundMachine Hide/Show SoundMachine
* MMM-SunRiseSet  Hide/Show Sunrise
* MMM-ToDoLive    Hide/Show Reminder
* MMM-History     Hide/Show History
* MMM-Astro       Hide/Show Horoscope
* MMM-DailyQuotes Hide/Show Quote
* MMM-Glock       Hide/Show Glock

## MagicMirror Default modules

* calendar        Hide/Show Calendar
* clock           Hide/Show Clock
* compliments     Hide/Show Compliments
* currentweather  Hide/Show Current
* newsfeed        Hide/Show Newsfeed
* weatherforecast Hide/Show Forecast


## Any module and custom commands added by request

Simply post your reqest in the MMM-VoiceCommander topic.
Name the module and the custom command you would like.
                
