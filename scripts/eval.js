console.log("Eval | Boy it's dangerous!™");

//Creating a class, so that we can const run so that it's not accidentally deleted or something;
//but we don't want the module to be public because wrapping the execute functions is important.
//stuff is json stringified when passed between clients, so we need to preparse it into a string,
//and the run function needs to handle unparsing it correctly.
class EvalModule {
    static #singleton = false;

    #module;

    //Only one instance of the class should be created. preferablly this would be done without a
    //class, but that would involve weakmaps or something to hide the module from the object, and
    //its just a bit easier this way, with only a smidge of extra stuff.
    constructor() {
        if (EvalModule.#singleton) {
            throw new Error("'run' is the singleton created from EvalModule; you can not create a new instance of this Class.");
        }

        console.log("Eval | Creating run object...");

        EvalModule.#singleton = true;
    }

    //module is only set once, that way it can't be overwritten.
    set module(module) {
        if (!this.#module) {
            this.#module = module;
        } else {
            throw new Error("The module can only be set initially, and then only accessed internally.");
        }
    }

    //We are taking something like
    //function bob(a, b, c) {
    //    return a + b + c;   
    //}
    //getting the body, and sending that across as a string,
    //along with the labeled arguments.
    #parse(callback) {
        const result = { };
        let fstr = callback.toString();

        //everything after first (
        fstr = fstr.substring(fstr.indexOf("(") + 1);
        
        //everything before first ), split into args by commas and any amount of spaces
        result.params = fstr.substring(0, fstr.indexOf(")") - 1).split(/, */);

        //everything after first { and before last }
        result.body = fstr.substring(fstr.indexOf("{") + 1, fstr.lastIndexOf("}") - 1);

        return result;
    }

    //Executes a function on all connected clients, including on the local client.
    async forEveryone(callback, ...args) {
        //The promise returned by this function will resolve as soon as the request
        //for execution has been sent to the connected clients and will not wait until
        //those clients have finished processing that function. The promise will not
        //yield any return value.
        return await this.#module.executeForEveryone("run", this.#parse(callback), ...args);
    }

    //Executes a function on all connected clients, but not locally.
    async forOthers(callback, ...args) {
        //The promise returned by this function will resolve as soon as the request
        //for execution has been sent to the connected clients and will not wait
        //until those clients have finished processing that function. The promise
        //will not yield any return value.
        return await this.#module.executeForOthers("run", this.#parse(callback), ...args);
    }

    //Executes a function on the clients of a specified list of players. 
    async forUsers(callback, users, ...args) {
        //The promise returned by this function will resolve as soon as the request
        //for execution has been sent to the specified clients and will not wait until
        //those clients have finished processing that function. The promise will not
        //yield any return value.
        return await this.#module.executeForUsers("run", users, this.#parse(callback), ...args);
    }

    //Executes a function on the clients of all connected GMs. If the current user
    //is a GM the function will be executed locally as well.
    async forAllGMs(callback, ...args) {
        //The promise returned by this function will resolve as soon as the request
        //for execution has been sent to the connected GM clients and will not wait
        //until those clients have finished processing that function. The promise will
        //not yield any return value.
        return await this.#module.executeForAllGMs("run", this.#parse(callback), ...args);
    }

    //Executes a function on the clients of all connected GMs, except for the current user.
    //If the current user is not a GM this function has the same behavior as
    //socket.executeForAllGMs.
    async forOtherGMs(callback, ...args) {
        //The promise returned by this function will resolve as soon as the request for
        //execution has been sent to the connected GM clients and will not wait until those
        //clients have finished processing that function. The promise will not yield any
        //return value.
        return await this.#module.executeForOtherGMs("run", this.#parse(callback), ...args);
    }

    //Executes a function on the client of exactly one GM. If multiple GMs are connected,
    //one of the GMs will be selected to execute the function. This function will fail
    //if there is no GM connected.
    async asGM(callback, ...args) {
        //The promise that this function returns will resolve once the GM has finished
        //the execution of the invoked function and will yield the return value of that
        //function. If the execution on the GM client fails for some reason, this function
        //will fail with an appropriate Error as well.
        return await this.#module.executeAsGM("run", this.#parse(callback), ...args);
    }

    //Executes a function on the client of the specified user. This function will fail
    //if the specified user is not connected.
    async asUser(callback, user_id, ...args) {
        //The promise that this function returns will resolve once the user has finished
        //the execution of the invoked function and will yield the return value of that
        //function. If the execution on other user's client fails for some reason, this
        //function will fail with an appropriate Error as well.
        return await this.#module.executeAsUser("run", user_id, this.#parse(callback), ...args);
    }
}

//All plugins are loaded locally, which means this object will exist on each
//users system. This is how each user can run code on other's computers, by
//wrapping the executeAs functions.
const run = new EvalModule();

Hooks.once("socketlib.ready", _ => {
    console.log("Eval | Registering module in socketlib...");

	const module = socketlib.registerModule("eval");

    console.log("Eval | Registering run function for module...");

    module.register("run", function(obj, ...args) {
        //spread syntax for params, rest arguments for args.
        //they look identical but we're doing two different things here.
        return new Function(...obj.params, obj.body)(...args);
    });

    run.module = module;
    
    console.log("Eval | All done!");
});