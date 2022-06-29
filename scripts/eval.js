let module;
const run = {};

console.log("Eval | Boy it's dangerous!™");

console.log("Eval | Creating runfunc...");

function runfunc(callback, ...args) {
    return callback(...args);
}

Hooks.once("socketlib.ready", _ => {
	module = socketlib.registerModule("eval");
    module.register("run", runfunc);
    console.log("Eval | Globally registered run through socketlib.");
});