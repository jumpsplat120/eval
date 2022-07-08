# eval
Foundry module that allows to run arbitrary code from any user to any other user in FoundryVTT.

Just use any of the `run` methods, such as run.forEveryone, or run.asUser, passing in a function as your first parameter, and any args you want as the rest. Args passed in will be scoped to you, so if you wrote a function and passed in `game.user.name`, then everyone would get *your* name. If you want everyone to have stuff be relevant to them, then you need to get a value like that within the function itself.

As well, it's important that you write your function like a regular function. That is to say, ```js
function(a, b, c) { return a + b + c; }```. If you use something like an arrow function, the parser might not recognize stuff and fail to get the parameters name, or the body. 

For more info on how it works, just check out the source code. It's got hella comments so the next time I come back to this I'm not confused at why it's so wonky and weird.