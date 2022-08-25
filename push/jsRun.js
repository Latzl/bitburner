/** @param {NS} ns */

const hostsObjFiles = '/src/hostsObj.script'
const file_autoAttack = 'autoAttack.js'

// run all autoAttack.js and target to hosts recored on hostsObj automatically;
export async function main(ns) {
  ns.clearLog()
  var scrt = ns.args[0];
  // clear port
  // while (ns.readPort(1) != 'NULL PORT DATA') {
  //   await ns.sleep(1);
  // }
  // sulutions
  switch (scrt) {
    case file_autoAttack:
      autoAttack(ns);
      break;
    default:
      ns.print('!!! Script name ERROR!')
      break;
  }
}


function autoAttack(ns) {
  ns.print('------------------ autoAttack ------------------')
  switch (ns.args.length) {
    case 1:
      var hostsObj = JSON.parse(ns.read(hostsObjFiles));
      var hosts =
          hostsObj.targetHosts.reverse();  // start from js that need least ram
      for (let i = 0; i < hosts.length; ++i) {
        var target = hosts[i];
        ns.print('=== target: ', target);
        if (ns.isRunning(file_autoAttack, ns.getHostname(), target)) {
          // ns.kill(file_autoAttack, ns.getHostname(), target);
          continue;  // to kill js that running, manually kill in game;
        }
        ns.run(file_autoAttack, 1, target);
      }
      break;
    case 3:
      var runHost = ns.args[1], targetHost = ns.args[2];
      ns.print('=== 2run: ', runHost, ', target: ', targetHost);
      if (!ns.isRunning(file_autoAttack, runHost, targetHost)) {
        ns.exec(file_autoAttack, runHost, 1, targetHost);
      } else {
        ns.tprint('!!! ', runHost, ' is running.');
      }
      break;
    default:
      break;
  }
}
