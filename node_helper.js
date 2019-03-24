/**
 * @file node_helper.js
 *
 * @originalAuthor fewieden MMM-VoiceControlMe
 * @inspirationalModules Hello-Lucy MMM-ModuleToggle MMM-Hotword MMM-AssistantMk2 MMM-MotionDetector
 * @extended  by TheStigh, Mykle1 and Sdetweil
 *
 * @license MIT
 *
 * @see  https://github.com/Mykle1/MMM-VoiceControlMe

/**
 * @external pocketsphinx-continuous @see https://github.com/fewieden/pocketsphinx-continuous-node
 * @external fs @see https://nodejs.org/api/fs.html 
 * @external child_process		@see https://nodejs.org/api/child_process.html
 * @external lmtool				@see https://www.npmjs.com/package/lmtool
 * @module Bytes @description Pure Magic
 * @external node_helper 		@see https://github.com/MichMich/MagicMirror/blob/master/modules/node_modules/node_helper/index.js */

const Psc = require('pocketsphinx-continuous');
const fs = require('fs');
const exec = require('child_process').exec;
const lmtool = require('lmtool');
const bytes = require('./Bytes.js');
const NodeHelper = require('node_helper');


/** @preparing for import for new function of checkCommands() */

var firstWord, secWord, thirdWord, fourthWord, modName, trueFalse, otherFunc, sendNoti

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

var loadingRules=fs.readFileSync('modules/MMM-VoiceControlMe/test.json', 'utf8');
var importedWords = JSON.parse(loadingRules);
//console.log(importedWords);

module.exports = NodeHelper.create({

    /** @member {boolean} listening - Flag to indicate listen state. */
    /** @member {(boolean|string)} mode - Contains active module mode. */
    /** @member {string[]} words - List of all words that are registered by the modules. */

    listening: false,
    mode: false, // was false,
    words: [],
	
    start() {
        console.log(`Starting module helper: ${this.name}`);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === 'START') {
            /** @member {Object} config - Module config. */
            this.config = payload.config;
			
			/** @member {number} time - Time to listen after keyword. */
            this.time = this.config.timeout * 1000;
            /** @member {Object} modules - List of modules with their modes and commands. */
            this.modules = payload.modules;

            this.fillWords();
            this.checkFiles();

////////////////////////////////////////////////////////////////////////
//////////////// 		Done by @sdetweil to			////////////////
//////////////// 	release mic from PocketSphinx		////////////////
//////////////// 	and create timer and checking		////////////////
////////////////////////////////////////////////////////////////////////
        } else if(notification === 'SUSPEND_LISTENING'){
          if(this.ps.isListening())
              this.ps.stopListening()
        } else if(notification === 'RESUME_LISTENING'){
          if(!this.ps.isListening())
              this.ps.startListening()
			
////////////////////////////////// EOC /////////////////////////////////
	
            // notification relayed from another module (alarm clock)

		} else if(notification === 'ACTIVATE_MONITOR') {
			if(this.config.standByMethod === 'DPMS')		/////////// Turns on laptop display and desktop PC with DVI @ Mykle1
				exec('xset dpms force on', null); 
			if(this.config.standByMethod === 'PI')  		/////////// Turns off HDMI on Pi
				exec('/opt/vc/bin/tvservice -p && sudo chvt 6 && sudo chvt 7', null);
				this.hdmi = true;

        } else if(notification === 'DEACTIVATE_MONITOR') {
			if(this.config.standByMethod === 'DPMS')  		/////////// Turns on laptop display and desktop PC with DVI @ Mykle1
				exec('xset dpms force off', null);
			if(this.config.standByMethod === 'PI')  		/////////// Turns off HDMI on Pi
				exec('/opt/vc/bin/tvservice -o', null);
				this.hdmi = false;		
    
        } else if(notification ==='MUTE_MIC') {
            this.config = payload;
            exec('amixer sset -M Master '+this.config, null);
        
        } else if(notification ==='RESTORE_MIC') {
            this.config = payload;
            exec('amixer sset -M Master '+this.config, null);
    
        }
    },

    /**
     * @function fillwords
     * @description Sets {@link node_helper.words} with all needed words for the registered
     * commands by the modules. This list has unique items and is sorted by alphabet.
     */
    fillWords() {
        // create array
        let words = this.config.keyword.split(' ');
        const temp = bytes.q.split(' ');
        words = words.concat(temp);
        for (let i = 0; i < this.modules.length; i += 1) {
            const mode = this.modules[i].mode.split(' ');
            //console.log('<<<>>> NODE HELPER modes: '+mode);
            words = words.concat(mode);
            for (let n = 0; n < this.modules[i].sentences.length; n += 1) {
                const sentences = this.modules[i].sentences[n].split(' ');
                //console.log('<<<>>> NODE HELPER SENTENCES: '+sentences);
                words = words.concat(sentences);
            }
        }

        // filter duplicates
        words = words.filter((item, index, data) => data.indexOf(item) === index);

        // sort array
        words.sort();

        this.words = words;
    },

    /**
     * @function checkFiles
     * @description Checks if words.json exists or has different entries as this.word.
     */
    checkFiles() {
        console.log(`${this.name}: Checking files.`);
        fs.stat('modules/MMM-VoiceControlMe/words.json', (error, stats) => {
            if (!error && stats.isFile()) {
                fs.readFile('modules/MMM-VoiceControlMe/words.json', 'utf8', (err, data) => {
                    if (!err) {
                        const words = JSON.parse(data).words;
                        if (this.arraysEqual(this.words, words)) {
                            this.startPocketsphinx();
                            return;
                        }
                    }
                    this.generateDicLM();
                });
            } else {
                this.generateDicLM();
            }
        });
    },

    /**
     * @function arraysEqual
     * @description Compares two arrays.
     *
     * @param {string[]} a - First array
     * @param {string[]} b - Second array
     * @returns {boolean} Are the arrays equal or not.
     */
    arraysEqual(a, b) {
        if (!(a instanceof Array) || !(b instanceof Array)) {
            return false;
        }

        if (a.length !== b.length) {
            return false;
        }

        for (let i = 0; i < a.length; i += 1) {
            if (a[i] !== b[i]) {
                return false;
            }
        }

        return true;
    },

    /**
     * @function generateDicLM
     * @description Generates new Dictionairy and Language Model.
     */
    generateDicLM() {
        console.log(`${this.name}: Generating dictionairy and language model.`);

        fs.writeFile('modules/MMM-VoiceControlMe/words.json', JSON.stringify({ words: this.words }), (err) => {
            if (err) {
                console.log(`${this.name}: Couldn't save words.json!`);
            } else {
                console.log(`${this.name}: Saved words.json successfully.`);
            }
        });

        lmtool(this.words, (err, filename) => {
            if (err) {
                this.sendSocketNotification('ERROR', 'Couldn\'t create necessary files!');
            } else {
                fs.renameSync(`${filename}.dic`, 'modules/MMM-VoiceControlMe/MMM-VoiceControlMe.dic');
                fs.renameSync(`${filename}.lm`, 'modules/MMM-VoiceControlMe/MMM-VoiceControlMe.lm');

                this.startPocketsphinx();

                fs.unlink(`${filename}.log_pronounce`, this.noOp);
                fs.unlink(`${filename}.sent`, this.noOp);
                fs.unlink(`${filename}.vocab`, this.noOp);
                fs.unlink(`TAR${filename}.tgz`, this.noOp);
            }
        });
    },

    /**
     * @function noOp
     * @description Performs no operation.
     */
    noOp() {},

    /**
     * @function startPocketsphinx
     * @description Starts Pocketsphinx binary.
     */
    startPocketsphinx() {
        console.log(`${this.name}: Starting pocketsphinx.`);

        this.ps = new Psc({
            setId: this.name,
            verbose: true,
            microphone: this.config.microphone
        });

        this.ps.on('data', this.handleData.bind(this));
        if (this.config.debug) {
            this.ps.on('debug', this.logDebug.bind(this));
        }

		

        this.ps.on('error', this.logError.bind(this));

////////////////////////////////////////////////////////////////////////
//////////////// 		Done by @sdetweil to			////////////////
//////////////// 	release mic from PocketSphinx		////////////////
//////////////// 	and create timer and checking		////////////////
////////////////////////////////////////////////////////////////////////
        if(typeof this.ps.startListening != 'function')
          console.log("downlevel pocketsphinx-continuous node module... error<===============================");

////////////////////////////////// EOC /////////////////////////////////

        this.sendSocketNotification('READY');
    },

    /**
     * @function handleData
     * @description Helper method to handle recognized data.
     *
     * @param {string} data - Recognized data
     */
    handleData(data) {
        if (typeof data === 'string') {
            if (this.config.debug) {
                console.log(`${this.name} has recognized: ${data}`);
                this.sendSocketNotification('DEBUG', data);
            }
            if (data.includes(this.config.keyword) || this.listening) {
// if hotword only, start prosess med å gå online med en gang
// er dette rett plass å sette inn?
              if (this.config.onlyHotword) { 
                  if(this.ps.isListening())
                      this.ps.stopListening();
                  console.log("sending socket notification, have released mic");  
                  this.sendSocketNotification('SUSPENDED');
                } 
                this.listening = true;
				this.sendSocketNotification('LISTENING');
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                this.timer = setTimeout(() => {
                    this.listening = false;
                    this.sendSocketNotification('SLEEPING');
                }, this.time);
            } else {
                return;
            }

            let cleanData = this.cleanData(data);

            for (let i = 0; i < this.modules.length; i += 1) {
                const n = cleanData.indexOf(this.modules[i].mode);

////////////////////////////////////////////////////////////////////////
//////////////// 		Done by @sdetweil to			////////////////
//////////////// 	release mic from PocketSphinx		////////////////
//////////////// 	and create timer and checking		////////////////
////////////////////////////////////////////////////////////////////////
                if (n === 0) {                    
                    this.mode= this.modules[i].mode;
////////////////////////////////// EOC /////////////////////////////////

                    cleanData = cleanData.substr(n + this.modules[i].mode.length).trim();
                    break;
                }
            }

////////////////////////////////////////////////////////////////////////
//////////////// 		Done by @sdetweil to			////////////////
//////////////// 	release mic from PocketSphinx		////////////////
//////////////// 	and create timer and checking		////////////////
////////////////////////////////////////////////////////////////////////
            this.mode='VOICE';
////////////////////////////////// EOC /////////////////////////////////

            if (this.mode) {
                this.sendSocketNotification('VOICE', { mode: this.mode, sentence: cleanData });
                if (this.mode === 'VOICE') {
                    this.checkCommands(cleanData);
                }
            }
        }
    },

    /**
     * @function logDebug
     * @description Logs debug information into debug log file.
     *
     * @param {string} data - Debug information
     */
    logDebug(data) {
        fs.appendFile('modules/MMM-VoiceControlMe/debug.log', data, (err) => {
            if (err) {
                console.log(`${this.name}: Couldn't save error to log file!`);
            }
        });
    },

    /**
     * @function logError
     * @description Logs error information into error log file.
     *
     * @param {string} data - Error information
     */
    logError(error) {
        if (error) {
            fs.appendFile('modules/MMM-VoiceControlMe/error.log', `${error}\n`, (err) => {
                if (err) {
                    console.log(`${this.name}: Couldn't save error to log file!`);
                }
                this.sendSocketNotification('ERROR', error);
            });
        }
    },

    /**
     * @function cleanData
     * @description Removes prefix/keyword and multiple spaces.
     *
     * @param {string} data - Recognized data to clean.
     * @returns {string} Cleaned data
     */
    cleanData(data) {
        let temp = data;
        const i = temp.indexOf(this.config.keyword);
        if (i !== -1) {
            temp = temp.substr(i + this.config.keyword.length);
        }
        temp = temp.replace(/ {2,}/g, ' ').trim();
        return temp;
    },

    /**
     * @function checkCommands
     * @description Checks for commands of voice module
     * @param {string} data - Recognized data
     */
    checkCommands(data) {

////////////////////////////////////////////////////////////////////////
//////////////// 		Done by @sdetweil to			////////////////
//////////////// 	release mic from PocketSphinx		////////////////
//////////////// 	and create timer and checking		////////////////
////////////////////////////////////////////////////////////////////////
        if (/(GO)/g.test(data) && /(ONLINE)/g.test(data)) {
        //} else if (/(GO)/g.test(data) && /(ONLINE)/g.test(data)) { 
            if(this.ps.isListening())
              this.ps.stopListening();
            console.log("sending socket notification, have released mic");  
            this.sendSocketNotification('SUSPENDED');
////////////////////////////////// EOC /////////////////////////////////

		} else if (/(PLEASE)/g.test(data) && /(WAKE)/g.test(data) && /(UP)/g.test(data)) {
			if(this.config.standByMethod === 'DPMS')		/////////// Turns on laptop display and desktop PC with DVI @ Mykle1
				exec('xset dpms force on', null); 
			if(this.config.standByMethod === 'PI')  		/////////// Turns on HDMI on Pi
				exec('/opt/vc/bin/tvservice -p && sudo chvt 6 && sudo chvt 7', null);
				this.hdmi = true;

        } else if (/(GO)/g.test(data) && /(SLEEP)/g.test(data)) {
			if(this.config.standByMethod === 'DPMS')  		/////////// Turns off laptop display and desktop PC with DVI @ Mykle1
				exec('xset dpms force off', null);
			if(this.config.standByMethod === 'PI')  		/////////// Turns off HDMI on Pi
				exec('/opt/vc/bin/tvservice -o', null);
				this.hdmi = false;
        
////////////////////////////////////////////////////////////////////////
////////////////	 	   Enhanced by @TheStigh		////////////////
//////////////// 		to toggle show/hide modules 	////////////////
////////////////////////////////////////////////////////////////////////


//********************************************************************//
//																	  //
//		Here you have to add what modules to hide/show.				  //
//		Just copy a 'block' of code and fill in commands from		  //
//		entries you have made in config.js and determine what		  //
//		module you want to hide/show.								  //
//																	  //
//********************************************************************//

        } else {     
        for (var xx = 0, l = importedWords.modOp.length; xx < l;) {
            var firstW = JSON.stringify(importedWords.modOp[xx].wordOne);
            var secW = JSON.stringify(importedWords.modOp[xx].wordTwo);
            var thirdW = JSON.stringify(importedWords.modOp[xx].wordThree);
            var fourthW = JSON.stringify(importedWords.modOp[xx].wordFour);
            var modN = JSON.stringify(importedWords.modOp[xx].moduleName);
            var Tf = JSON.stringify(importedWords.modOp[xx].toShow);
            var oF = JSON.stringify(importedWords.modOp[xx].otherFunc);
            var sN = JSON.stringify(importedWords.modOp[xx].sendNoti);
            firstWord = firstW.replace(/"/g, "");
            secWord = secW.replace(/"/g, "");
            thirdWord = thirdW.replace(/"/g, "");
            fourthWord = fourthW.replace(/"/g, "");
            modName = modN.replace(/"/g, "");
            trueFalse = Tf.replace(/"/g, "");
            sendNoti = sN.replace(/"/g, "");
            this.firstWord = RegExp(firstWord);
            this.secWord = RegExp(secWord);
            this.thirdWord = RegExp(thirdWord);
            this.fourthWord = RegExp(fourthWord);
            this.modName = modName;
            this.trueFalse = trueFalse;
            this.sendNoti = sendNoti;
////////////////////////////////////////////////////////////////////////////////    
                if (this.firstWord.test(data) && this.secWord.test(data) && this.thirdWord.test(data) && this.fourthWord.test(data)) {
                    console.log('>>> modName & sendNoti : '+this.modName+' '+this.sendNoti);
                    if (this.modName != "") {    
                        if (this.trueFalse === "true") {
                            //console.log('>>> Treff på ord med TRUE aktiv, verdi av toShow er: '+this.trueFalse);
                            //console.log('>>> Treff SHOW: Første ord: '+this.firstWord+' Andre ord: '+this.lastWord+' Tf: '+this.trueFalse);
                                this.sendSocketNotification('MODULE_STATUS',{hide: [], show: [this.modName], toggle:[]});
                            } else { 
                            //    console.log('<<<>>> Treff HIDE:: '+this.trueFalse);
                                this.sendSocketNotification('MODULE_STATUS',{hide: [this.modName], show: [], toggle:[]});
                            }
                        } else {
                        this.sendSocketNotification('MODULE_UPDATE',this.sendNoti);
                    }
////////////////////////////////////////////////////////////////////////////////
                };xx++; 
            };
        }
    }
	
});