/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  const port = 1;
  var str = ns.peek(port);
  while (true) {
    // if (ns.peek(port) != 'NULL PORT DATA' && ns.peek(port) != str)
    ns.print(str = ns.peek(port));
    await ns.sleep(1000);
  }
}