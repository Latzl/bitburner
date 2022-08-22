/** @param {NS} ns */

// clear port according to args;
export async function main(ns) {
  ns.disableLog('ALL')
  for (let i = 0; i < ns.args.length; ++i) {
    var port = i + 1;
    while (ns.readPort(port) != 'NULL PORT DATA') {
      await ns.sleep(1);
    }
  }
  ns.tprint('=== port cleared: ', ns.args);
}