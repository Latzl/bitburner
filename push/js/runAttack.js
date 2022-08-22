// From VSCode

/** @param {NS} ns */

import {moneyFix} from './allin';
const dir = '/attack/'
var files = ['hack.js', 'grow.js', 'weaken.js'];
for (var i = 0; i < files.length; ++i) {
  files[i] = dir + files[i];
}
const refreshTiem = 2000;

export async function main(ns) {
  ns.clearLog();
  ns.disableLog('ALL');
  var sourceHost, targetHost;
  switch (ns.args.length) {
    case 1:
      sourceHost = targetHost = ns.args[0];
      break;  // run on own server to attack remote server
    case 2:   // run on remote server to attack remote server
      sourceHost = ns.args[0];
      targetHost = ns.args[1];
      break;
    default:
      ns.print('!!! error args')
      break;
  }
  if (ns.getServerMaxRam(sourceHost) == 0) {
    ns.tprint('!!! ', sourceHost, ' ram: 0, ', sourceHost, ' --> ', targetHost)
    ns.exit()
  }
  if (sourceHost == targetHost && ns.getServerMaxMoney(sourceHost) == 0) {
    ns.tprint(
        '!!! ', sourceHost, ' money: 0, ', sourceHost, ' --> ', targetHost)
    ns.exit()
  }
  let mny = new Money(ns, sourceHost, targetHost);
  let scrt = new Security(ns, sourceHost, targetHost);
  while (true) {
    if (scrt.lowSecurityLevel()) {
      if (mny.lowMoney())
        await mny.growSolution(scrt);
      else
        await mny.hackSolutio(scrt);
    } else {
      await scrt.weakenSolution();
    }
  }
}

// return max amount of thread script can take
function getMaxScriptThread(ns, script, host) {
  var a = ns.getServerMaxRam(host), b = ns.getScriptRam(script, host)
  var thread = Math.trunc(a / b);
  return thread;
}

class Security {
  constructor(ns, sourceHost, targetHost) {
    ns.disableLog('ALL');
    this.ns = ns;
    this.sourceHost = sourceHost;
    this.targetHost = targetHost;
    this.weakenfile = files[2];
    this.currLevel = ns.getServerSecurityLevel(targetHost);
    this.minLevel = ns.getServerMinSecurityLevel(targetHost);
    this.maxLevel = this.minLevel * 3;
    this.weakRunTimes = 0;
  }
  lowSecurityLevel() {  // judge if minLevel <= level < maxLevl;
    this.currLevel = this.ns.getServerSecurityLevel(this.targetHost);
    return this.currLevel >= this.minLevel && this.currLevel < this.maxLevel;
  }
  async weakenSolution() {  // loop weaken until level less than minLevel;
    var info_begin = 'weaken.js running, times: ';
    this.weakRunTimes++;
    await this.ns.print('>>> Security::weakenSolution() calling.');
    await this.ns.killall(this.sourceHost);  // kill all script
    await this.ns.exec(
        this.weakenfile, this.sourceHost,
        getMaxScriptThread(this.ns, this.weakenfile, this.sourceHost),
        this.targetHost);  // run weaken.js
    if (!this.ns.scriptRunning(this.weakenfile, this.sourceHost))
      this.ns.print('!!! weaken.js failed to run.');
    // loop until level less than minlevel*1.1
    while (this.currLevel >= this.minLevel * 1.1) {
      this.currLevel = this.ns.getServerSecurityLevel(this.targetHost);
      if (this.ns.peek(1) == 'From ' + this.sourceHost) {
        this.ns.readPort(1);
        var info = info_begin + this.weakRunTimes + '\n||  weaken cost time: ' +
            (this.ns.getWeakenTime(this.targetHost) / 60000).toFixed(0) + 'm' +
            (this.ns.getWeakenTime(this.targetHost) / 1000 % 60).toFixed(1) +
            's';
        this.ns.print(infout(this, info));
      }
      await this.ns.sleep(refreshTiem);
    }

    await this.ns.print('<<< Security::weakenSolution() finished.');
  }
}

class Money {
  constructor(ns, sourceHost, targetHost) {
    ns.disableLog('ALL');
    this.ns = ns;
    this.sourceHost = sourceHost;
    this.targetHost = targetHost;
    this.hackfile = files[0];
    this.growfile = files[1];
    this.currMoney = ns.getServerMoneyAvailable(targetHost);
    this.maxMoney = ns.getServerMaxMoney(targetHost);
    this.growRunTimes = 0;
    this.hackRunTimes = 0;
  }
  lowMoney() {  // return true if currMoney < 0.8maxMoney;
    this.currMoney = this.ns.getServerMoneyAvailable(this.targetHost);
    return this.currMoney < this.maxMoney * 0.8;
  }

  async growSolution(scrt) {  // loop grow until money more than 0.97maxMony;
    var info_begin = 'grow.js running, times: ';
    this.growRunTimes++;
    await this.ns.print('>>> Money::growSolution() calling.');
    await this.ns.killall(this.sourceHost);  // kill all script on source host
    await this.ns.exec(
        this.growfile, this.sourceHost,
        getMaxScriptThread(this.ns, this.growfile, this.sourceHost),
        this.targetHost);  // run grow.js on source host
    if (!this.ns.scriptRunning(this.growfile, this.sourceHost))
      this.ns.print('!!! grow.js failed to run.');
    // loop until Money not less than threshold;
    while (this.currMoney < this.maxMoney * 0.97 && scrt.lowSecurityLevel()) {
      this.currMoney = this.ns.getServerMoneyAvailable(this.targetHost);
      if (this.ns.peek(1) == 'From ' + this.sourceHost) {
        this.ns.readPort(1);
        var info = info_begin + this.growRunTimes + '\n||  grow cost time: ' +
            (this.ns.getGrowTime(this.targetHost) / 60000).toFixed(0) + 'm' +
            (this.ns.getGrowTime(this.targetHost) / 1000 % 60).toFixed(1) + 's';
        this.ns.print(infout(this, info));
      }
      await this.ns.sleep(refreshTiem);
    }
    if (scrt.lowSecurityLevel())
      await this.ns.print('<<< Money::growSolution() finished.');
    else
      await this.ns.print('<<< Money::growSolution() break case high level.');
  }

  async hackSolutio(scrt) {  // loop hack until money less than 0.8maxMoney
    var info_begin = 'hack.js running, times: '
    var maxthread =
        getMaxScriptThread(this.ns, this.hackfile, this.sourceHost) >
            this.ns.hackAnalyzeThreads(this.targetHost, 0.25 * this.maxMoney) ?
        this.ns.hackAnalyzeThreads(this.targetHost, 0.25 * this.maxMoney) :
        getMaxScriptThread(this.ns, this.hackfile, this.sourceHost);
    this.hackRunTimes++;
    await this.ns.print('>>> Money::hackSolutio() calling.');
    await this.ns.killall(this.sourceHost);  // kill all script
    await this.ns.exec(
        this.hackfile, this.sourceHost, maxthread,
        this.targetHost);  // run grow.js
    if (!this.ns.scriptRunning(this.hackfile, this.sourceHost))
      this.ns.print('!!! hack.js failed to run.');
    // loop until Money less than threshold;
    while (this.currMoney >= this.maxMoney * 0.8 && scrt.lowSecurityLevel()) {
      this.currMoney = this.ns.getServerMoneyAvailable(this.targetHost);
      if (this.ns.peek(1) == 'From ' + this.sourceHost) {
        this.ns.readPort(1);
        var info = info_begin + this.hackRunTimes + '\n||  hack cost time: ' +
            (this.ns.getHackTime(this.targetHost) / 60000).toFixed(0) + 'm' +
            (this.ns.getHackTime(this.targetHost) / 1000 % 60).toFixed(1) + 's';
        this.ns.print(infout(this, info));
      }
      await this.ns.sleep(refreshTiem);
    }

    if (scrt.lowSecurityLevel())
      await this.ns.print('<<< Money::hackMoneySolution() finished.');
    else
      await this.ns.print(
          '<<< Money::hackMoneySolution() break case high level.');
  }
}

function infout(obj, info_in) {
  var info = '------------------------------' +
      '\n||= ' + info_in + '\n||  Current money: ' +
      moneyFix(obj.ns.getServerMoneyAvailable(obj.targetHost)) + '/' +
      moneyFix(obj.ns.getServerMaxMoney(obj.targetHost) * 0.97) +
      '\n||  security level: ' +
      obj.ns.getServerSecurityLevel(obj.targetHost).toFixed(3) + '/' +
      obj.ns.getServerMinSecurityLevel(obj.targetHost).toFixed(3) +
      '\n||  Hack chance: ' +
      (obj.ns.hackAnalyzeChance(obj.targetHost) * 100).toFixed(2) + '%' +
      '\n------------------------------';
  return info;
}
