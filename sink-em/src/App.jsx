import {useEffect, useRef, useState} from "react";
import "./App.css";
import Grid from "./Grid.jsx";
import BoardWithAxes from "./axis.jsx"
import ShipPlacement from "./ShipPlacement.jsx";
import Header from "./Header.jsx";

function App() {
    const [placingGridVals, setPlacingGridVals] = useState(Array.from({length: 10}, () => Array(10).fill(null)));
    const [firingGridVals, setFiringGridVals] = useState(Array.from({length: 10}, () => Array(10).fill(null)));
    const [userMessage, setUserMessage] = useState('')
    const [gameCode, setGameCode] = useState('')
    const [gameCreated, setGameCreated] = useState(false)
    const [joiningGame, setJoiningGame] = useState(false)
    const [joinCode, setJoinCode] = useState('')
    const [isWaitingForReady, setIsWaitingForReady] = useState(true)
    const [isPlacing, setIsPlacing] = useState(false)
    const [firingCoords, setFiringCoords] = useState(false)
    const [isFiring, setIsFiring] = useState(false)
    const [isMyFireTurn, setIsMyFireTurn] = useState(false)
    const [timer, setTimer] = useState(30)
    const [isGameEnded, setIsGameEnded] = useState(false)
    const adj = ["frosty", "regal", "flustered", "fiery", "dapper", "zesty", "vibrant", "sneaky", "breezy", "grumpy", "bright", "charmed", "bashful", "eager", "weepy", "jovial", "active", "agile", "awkward", "quick", "slow", "fast", "speedy", "unhurried", "swift", "rapid", "deliberate", "aggressive", "wild", "tame", "docile", "harmless", "dangerous", "loud", "bold", "calm", "kind", "tough", "quiet", "urban", "funny", "rural", "messy", "goofy", "rowdy", "sad", "mad", "pro", "shy", "sly", "happy", "smart", "busy", "glad", "mean", "wise", "rude", "civil", "angry", "tired", "proud", "harsh", "upset", "loyal", "vocal", "brave", "alert", "bored", "naive", "weary", "merry", "dizzy", "witty", "moody", "timid", "jolly", "sassy", "picky", "irate", "social", "honest", "modest", "hungry", "scared", "gifted", "gentle", "decent", "casual", "strict", "brutal", "fierce", "clever", "mature", "loving", "polite", "lively", "amazed", "humble", "mighty", "heroic", "poetic", "tricky", "sleepy", "wicked", "ragged", "amused", "clumsy", "caring", "daring", "upbeat", "gloomy", "quirky", "frigid", "raging", "wanted", "unruly", "feeble", "dreamy", "sullen", "expert", "cranky", "nimble", "fickle", "frugal", "drowsy", "serious", "popular", "healthy", "careful", "violent", "leading", "nervous", "capable", "unknown", "helpful", "curious", "worried", "ethical", "excited", "patient", "wealthy", "dynamic", "content", "anxious", "elegant", "logical", "unhappy", "skilled", "hopeful", "devoted", "notable", "furious", "passive", "ashamed", "foolish", "relaxed", "jealous", "smiling", "fearful", "vicious", "puzzled", "sincere", "cynical", "frantic", "annoyed", "playful", "stylish", "stunned", "defiant", "runaway", "robotic", "trusted", "focused", "erratic", "worldly", "unnamed", "pitiful", "naughty", "cunning", "unlucky", "alarmed", "likable", "comical", "lovable", "envious", "zealous", "valiant", "tearful", "enraged", "aimless", "tactful", "positive", "powerful", "negative", "creative", "innocent", "friendly", "detailed", "artistic", "peaceful", "grateful", "generous", "talented", "tropical", "charming", "cautious", "confused", "sleeping", "credible", "sensible", "vigorous", "decisive", "obsessed", "imminent", "outraged", "affluent", "cheerful", "renowned", "graceful", "restless", "worrying", "stubborn", "thankful", "gracious", "outgoing", "ruthless", "reserved", "startled", "hesitant", "humorous", "eloquent", "aspiring", "fearless", "skillful", "nameless", "carefree", "diligent", "laughing", "lonesome", "selfless", "concerned", "emotional", "surprised", "technical", "confident", "brilliant", "skeptical", "respected", "dedicated", "energetic", "civilized", "impatient", "exhausted", "terrified", "talkative", "unfair", "shocked", "unaware", "seasick", "jubilant", "sheepish", "dejected", "likeable", "frazzled", "effective", "sensitive", "anonymous", "competent", "fictional", "qualified", "scholarly", "unwilling", "committed", "delighted", "suspected", "honorable", "executive", "eccentric", "visionary", "listening", "attentive", "traveling", "motivated", "proactive", "hilarious", "nostalgic", "admirable", "dignified", "forgiving", "welcoming", "righteous", "insistent", "assertive", "ferocious", "deserving", "acclaimed", "impartial", "secretive", "exuberant", "heartfelt", "sarcastic", "leisurely", "nocturnal", "agreeable", "indignant", "tenacious", "courteous", "easygoing", "irritated", "observant", "wandering", "merciless", "perplexed", "overjoyed", "contented", "unselfish", "forgetful", "immune", "mortal", "serene", "cheesy", "olympic", "pleased", "neutral", "adverse", "ominous", "festive", "ghostly", "adamant", "budding", "knowing", "glaring", "resting", "nagging", "honored", "mocking", "wishful", "wayward", "howling", "forlorn", "fleeing", "amiable", "lenient", "sketchy", "jittery", "dashing", "dutiful", "gleeful", "baffled", "admired", "thrifty", "untamed", "suspect", "bookish", "lurking", "cloaked", "involved", "academic", "dramatic", "unlikely", "handsome", "prepared", "rigorous", "animated", "coherent", "informed", "gleaming", "inspired", "tolerant", "discrete", "eclectic", "engaging", "honorary", "tutoring", "relieved", "discreet", "truthful", "vigilant", "literate", "virtuous", "watchful", "appalled", "marching", "tranquil", "charging", "brooding", "fearsome", "trusting", "tireless", "resolute", "exacting", "cultured", "rambling", "amenable", "unbiased", "dogmatic", "ordained", "olympian", "thrilled", "dismayed", "merciful", "blissful", "vengeful", "laudable", "skittish", "sociable", "vehement", "crawling", "stealthy", "downcast", "scornful", "reverent", "amicable", "princely", "pampered", "cheering", "fatigued", "juggling"]
    const animal = ["alligator", "alpaca", "anteater", "antelope", "armadillo", "baboon", "badger", "bat", "bear", "beaver", "bird", "bison", "boa", "boar", "buffalo", "butterfly", "camel", "cat", "cheetah", "chimpanzee", "chipmunk", "cobra", "cow", "coyote", "crab", "crane", "crocodile", "crow", "deer", "dog", "dolphin", "dove", "dragonfly", "duck", "eagle", "elephant", "elk", "emu", "falcon", "ferret", "fish", "flamingo", "flicker", "fox", "gazelle", "gecko", "giraffe", "goat", "goose", "gorilla", "grizzly", "groundhog", "hawk", "hedgehog", "hen", "hippopotamus", "hyena", "iguana", "insect", "jackal", "jaguar", "kangaroo", "koala", "lemur", "leopard", "lion", "lizard", "llama", "lynx", "magpie", "manatee", "mockingbird", "mongoose", "monkey", "moose", "mouse", "orca", "ostrich", "otter", "owl", "ox", "peacock", "pelican", "penguin", "pigeon", "platypus", "porcupine", "possum", "puma", "python", "rabbit", "raccoon", "rat", "rattlesnake", "rhinoceros", "salmon", "seal", "shark", "sheep", "skunk", "sloth", "snake", "sparrow", "spider", "squirrel", "starfish", "swan", "tarantula", "tiger", "tortoise", "turkey", "turtle", "viper", "vulture", "whale", "wolf", "wombat", "woodpecker", "yak", "zebra"]
    const capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const username = capitalize(adj[Math.floor(Math.random() * adj.length)]) + capitalize(animal[Math.floor(Math.random() * animal.length)])
    const [displayName, setDisplayName] = useState(username)
    let opponentDisplayName = useRef("Opponent")
    const [switchTurnsCooldown, setSwitchTurnsCooldown] = useState(false)
    const [personalSunkShips, setPersonalSunkShips] = useState([])
    const [oppSunkShips, setOppSunkShips] = useState([])

    // track winner
    const [winner, setWinner] = useState("");

    // show header only when game in session
    // show header only during actual gameplay boards
    const showHeader =
    gameCreated &&
    !isWaitingForReady &&
    (isPlacing || isFiring) &&
    !!displayName &&
    !isGameEnded; // hide once game ends



    const ws = useRef(null);

    const makeNewWS = (code) => {
        if (ws.current) {
            ws.current.close()
        }
        ws.current = new WebSocket(`/ws/?id=${code}`)

        ws.current.onopen = () => {
            console.log("Connected to WS server");

            ws.current.onmessage = async msgSent => {
                let msg;
                try {
                    msg = JSON.parse(msgSent.data);
                } catch (e) {
                    console.error("Invalid JSON:", msgSent);
                    return;
                }

                console.log("received", msg)
                const {type, payload} = msg;
                if (type === "Waiting") {
                    setUserMessage(type)
                } else if (type === "Full") {
                    setUserMessage(type)
                } else if (type === "InvalidCode") {
                    setUserMessage("Invalid code.")
                    setGameCode('')
                    setJoinCode('')
                    setJoiningGame(false)
                    setGameCreated(false)
                } else if (type === "Disconnected") {
                    setUserMessage(`${payload.OppName} has disconnected. The game has been reset. Reload to create a new game.`)
                } else if (type === "StartPlacing") {
                    setUserMessage("Start placing")
                    opponentDisplayName.current = payload.OpponentDisplayName
                    //change game state
                    setIsWaitingForReady(false)
                    setIsPlacing(true)
                } else if (type === "Firing") {

                    //update boards
                    setFiringGridVals(payload.guessGrid)
                    setPlacingGridVals(payload.placingGrid)

                    //start the firing stage of the game!
                    setIsPlacing(false)
                    setIsFiring(true)

                    //set sunk ships
                    setPersonalSunkShips(payload.PersonalSunkShips)
                    setOppSunkShips(payload.OppSunkShips)

                    //check if current player's turn
                    if (payload.YourTurn) {
                        //upon receiving the opponent's hit/miss update, show your personal board 
                        //for 5 seconds before moving to showing your firing board
                        if(payload.Result === 'H') {
                            setUserMessage(`${opponentDisplayName.current} hit your ship! 💥`)
                        }
                        else if(payload.Result === 'M') {
                            setUserMessage(`${opponentDisplayName.current} missed! 🌊`)
                        }
                        else if(payload.Result === "None") {
                            setUserMessage("Both players ready. Starting game soon...")
                        }
                        else if(payload.Result === "No Fire") {
                            setUserMessage(`${opponentDisplayName.current} did not make a guess in time, no shot fired.`)
                        }

                        //do firing functionality to get user's guess square coordinates
                        setTimeout(() => {
                            setUserMessage("It is your turn to fire. You have 30 seconds.")
                            setIsMyFireTurn(true)
                        }, 4000)

                        //after firing has completed, send coordinates of square back to the server
                    } else {
                        //upon receiving your previous shot's hit/miss update, show your guess board
                        //for 5 seconds before moving to showing your personal board
                        if(payload.Result === 'H') {
                            if(payload.DidSink) {
                                setSwitchTurnsCooldown(true)
                                setUserMessage("You sunk a ship! ☠️")
                            }
                            else {
                                setSwitchTurnsCooldown(true)
                                setUserMessage("You hit a ship! 💥")
                            }
                        }
                        else if(payload.Result === 'M') {
                            setSwitchTurnsCooldown(true)
                            setUserMessage("You missed! 🌊")
                        }
                        else if(payload.Result === "None") {
                            setUserMessage("Both players ready. Starting game soon...")
                        }
                        else if(payload.Result === "No Fire") {
                            setUserMessage("You did not make a guess in time, no shot fired.")
                        }

                        setTimeout(() => {
                            //wait on other user to fire
                            setUserMessage(`Waiting for ${opponentDisplayName.current} to fire..`)
                            setIsMyFireTurn(false)
                            setSwitchTurnsCooldown(false)
                        }, 4000)
                    }

                } else if (type === "End") {
                    //game has ended, display winner
                    console.log(payload.Winner)
                    setUserMessage('')
                    setWinner(payload.Winner)
                    setIsMyFireTurn(false)
                    setIsFiring(false)
                    setIsGameEnded(true)
                } else {
                    setUserMessage(type)
                }
            };


            ws.current.onclose = () => {
                console.log("WebSocket connection closed");
            };

            return () => {
                console.log("Cleaning up WS connection");
                ws.current?.close();
            };

        }
    }
    const updateSquareChoicePlacing = (x, y) => {
        //update grid
        const tempGrid = placingGridVals.map(row => [...row]);
        tempGrid[x][y] = 'S'
        setPlacingGridVals(tempGrid)
    };

    const updateSquareChoiceFiring = (x, y) => {
        if (!isMyFireTurn) {
          return
        }

        //check if square has already been guessed, if not, set
        if(firingGridVals[x][y] === 'H' || firingGridVals[x][y] === 'M') {
            return
        }
        else {
            setFiringCoords ({x, y})
        }
    };

    const makeGame = async () => {
        const res = await fetch("/create", {method: "GET"})
        const json = JSON.parse((await res.text()))
        setGameCode(json.code)
        setGameCreated(true)
        makeNewWS(json.code)
    }

    const joinGame = async () => {
        const code = joinCode.trim();
        if (!code) {
            return
        }
        setGameCode(code)
        setJoiningGame(true)
        setGameCreated(true)
        makeNewWS(code)
    }

    const sendReadyToStart = () => {
        if (displayName.length > 0){
            console.log("sending ready")
            ws.current.send(JSON.stringify({type: 'Ready', payload: {Ready: true, DisplayName: displayName}}));
        } else {
            alert("You must choose a display name!")
        }
    }

    const submitFiringCoords = () => {
      if (!firingCoords){
        return
      }

      const {x, y} = firingCoords
      sendFiringSquare(x, y)
      setFiringCoords(null)

      setTimeout (() => {
        setIsMyFireTurn(false)
      }, 4000)
    }

    const sendFiringSquare = (x, y) => {
        ws.current.send(JSON.stringify({type: 'FiringGuess', payload: {GuessX: x, GuessY: y}}));
    }

    const goHome = () => {
        try { ws.current?.close(); } catch {}
        ws.current = null;

        // reset states for new game
        setPlacingGridVals(Array.from({ length: 10 }, () => Array(10).fill(null)));
        setFiringGridVals(Array.from({ length: 10 }, () => Array(10).fill(null)));
        setUserMessage("");
        setGameCode("");
        setGameCreated(false);
        setJoiningGame(false);
        setJoinCode("");
        setIsWaitingForReady(true);
        setIsPlacing(false);
        setIsFiring(false);
        setIsMyFireTurn(false);
        setIsGameEnded(false);
        setWinner("");
        setSwitchTurnsCooldown(false)
        setPersonalSunkShips([])
        setOppSunkShips([])
        };


    const killTimer = useRef(null)

      useEffect(() => {
        if (isMyFireTurn) {
          setTimer (30)

          killTimer.current = setInterval(() => {
            setTimer (t => {
              if (t <= 1) {
                clearInterval(killTimer.current)
                setIsMyFireTurn(false)

                //send non-guess to server
                ws.current.send(JSON.stringify({type: 'FiringNonGuess', payload: "None"}));
                return 0
              }
              return t - 1
            })
          }, 1000)
        }
        return () => {
          if (killTimer.current) {
            clearInterval(killTimer.current)
            killTimer.current = null
          }
        }
      }, [isMyFireTurn])

      // show sunken ships to the rigth of board
      function SunkenShipsCard({ title, ships }) {
        return (
            <div className="card-empty w-56 p-3 text-sm">
            <h3 className="font-semibold mb-2">{title}</h3>
            {ships?.length ? (
                <ul className="list-disc list-inside space-y-1">
                {ships.map((s) => <li key={s}>{s}</li>)}
                </ul>
            ) : (
                <p className="text-gray-600">None yet</p>
            )}
            </div>
        );
        }

    return (
        <div className="page">
            {showHeader && (
            <Header
                title="Sink ’Em 🚢"
                displayName={displayName}
                opponentName={opponentDisplayName.current}
                gameCode={gameCode}
                userMessage={userMessage}
                timer={timer}
                isMyFireTurn={isMyFireTurn && !switchTurnsCooldown}
                onHome={goHome}
            />
            )}
        <main className="flex-1 w-full flex flex-col items-center justify-center px-4">
            {!showHeader && (
                <div className="text-center">
                    <h1 className="h1">
                    <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">
                        Sink ’Em 🚢
                    </span>
                    </h1>
                    <p className="subtext">The Classic Naval Combat Game</p>
                    {/* {userMessage} */}
                </div>
            )}


            {userMessage}
            {/* <br /> */}

            {/* Create new or join existing game */}
            {!gameCreated && !joiningGame && (
                <div className="card-empty w-full max-w-lg mx-auto">
                    <div className="grid gap-3">
                        <button className ="btn" onClick={makeGame}>⚓ Create Game</button>
                        <button className ="btn-1" onClick={() => {setJoiningGame(true); setUserMessage('')}}>
                            {/* link icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 015.657 5.657l-2.121 2.121a4 4 0 01-5.657-5.657M10.172 13.828a4 4 0 01-5.657-5.657l2.121-2.121a4 4 0 015.657 5.657" />
                            </svg>
                            Join Existing Game</button>
                    </div>
                </div>
            )}

            {/* join existing game */}
            {joiningGame && !gameCreated && (
                <div className="card-empty w-full max-w-lg mx-auto">
                    <div className="grid gap-3">
                         <h2 className="h2"> Enter Game Code 🛳️ </h2>
                         <p className="subtext">Join an existing battleship game.</p>
                        <input type="text" value={joinCode} onChange={(i) => setJoinCode(i.target.value)} className="border-2 border-gray-300 rounded-md p-2 text-black bg-white" placeholder="e.g. 68e827987889fd33716f834e"/>
                        <button className ="btn" onClick={joinGame}>Join game</button>
                    </div>
                </div>
            )}

            {/* create game code for new game */}
            {gameCreated && isWaitingForReady && (
                <div className="card-empty w-full max-w-lg mx-auto">
                    <div className="grid gap-3">
                        <h2 className="h2"> Code Created 🛳️ </h2>
                         <p className="subtext"> Share this code with your opponent so they can join.</p>
                        <div className="code">
                            {/* copy to clipboard button  */}
                             <div className="card-white">
                                <span className="code-font">
                                    {gameCode}
                                </span>
                            <button
                                type="button"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(gameCode);   // ← copy!
                                }} className="btn-copy">
                                {/* Clipboard icon */}
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
                                />
                                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                                </svg> Copy
                            </button>
                        </div>
                         </div>
                        <h3 className="h3"> Display Name: </h3>
                        <input type="text" value={displayName} onChange={(i) => setDisplayName(i.target.value)} className="border-2 border-gray-300 rounded-md p-2 text-black bg-white" placeholder="Display Name"/>
                        <button className ="btn" onClick={sendReadyToStart}> Ready! </button>
                    </div>
                </div>

            )}

            {/* Start placing ships */}
            {isPlacing ? (
                <div>
                    <ShipPlacement onDone={(board, ships) => {
                        // send the board colors/values to server as Placements
                        console.log("SENDING:", board, ships)
                        ws.current.send(JSON.stringify({type: 'Placed', payload: {Placements: board, Ships: ships}}));
                        setIsPlacing(false);
                        setUserMessage("Waiting...")
                    }} />
                </div>
            ) : ''}

            {/* your turn to fire */}
            {isFiring && isMyFireTurn && (
                <div className="mx-auto max-w-6xl px-4">
                    <div className="w-full text-center mb-4">
                        {!switchTurnsCooldown && <p>Time remaining ⏳: {timer}</p>}
                    </div>
                    <div className="flex flex-row items-start gap-8">
                    {/* headings centered + board */}
                    <div className="flex-1">
                        <div className="text-center space-y-2">
                        <p className="h3">Your Targeting Grid:</p>
                        </div>

                        <div className="flex justify-center mt-2">
                        <BoardWithAxes>
                            <Grid
                            gridVals={firingGridVals}
                            handleSquareChoice={updateSquareChoiceFiring}
                            selected={firingCoords}
                            isForPlacing={false}
                            isFleetGrid={false}
                            />
                        </BoardWithAxes>
                        </div>

                        {!switchTurnsCooldown && (
                        <div className="flex justify-center mt-3">
                            <button className="btn" onClick={submitFiringCoords} disabled={!firingCoords}>
                            Submit Fire Location
                            </button>
                        </div>
                        )}
                    </div>

                    {/* stacked cards */}
                    <div className="flex flex-col gap-4 self-start mt-30">
                        <div className="card-empty w-56 p-3 text-sm">
                        <h3 className="font-semibold mb-2">Legend</h3>
                        <ul className="space-y-1">
                            <li>💥 = Hit</li>
                            <li>🌊 = Miss</li>
                        </ul>
                        </div>

                        {/* Ships you've sunk (against opponent) */}
                        <SunkenShipsCard title="Ships You've Sunk" ships={oppSunkShips} />
                    </div>
                </div>
            </div>
            )}

            {/* oppenents turn to fire */}
            {isFiring && !isMyFireTurn && (
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex flex-row items-start gap-8">
                    {/* LEFT: headings centered + board */}
                    <div className="flex-1">
                        <div className="text-center space-y-2">
                        <p className="h3">Your Fleet Grid:</p>
                        </div>

                        <div className="flex justify-center mt-2">
                        <BoardWithAxes>
                            <Grid
                            gridVals={placingGridVals}
                            handleSquareChoice={() => {}}
                            isForPlacing={false}
                            isFleetGrid={true}
                            />
                        </BoardWithAxes>
                        </div>
                    </div>

                    {/* stacked cards - legend and sunken ships*/}
                    <div className="flex flex-col gap-4 self-start mt-30">
                        <div className="card-empty w-56 p-3 text-sm">
                        <h3 className="font-semibold mb-2">Legend</h3>
                        <ul className="space-y-1">
                            <li>💥 = Hit</li>
                            <li>🌊 = Miss</li>
                        </ul>
                        </div>

                        {/* show your sunken ships */}
                        <SunkenShipsCard title="Your Sunken Ships" ships={personalSunkShips} />
                    </div>
                    </div>
                </div>
            )}
            
            {/* game over */}
            {isGameEnded ? (
                <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-bold">Game Over</h2>
                    <p className="text-lg">Winner: <strong>{winner}</strong></p>
                    <p> Game has ended</p>
                    <button className="btn" onClick={goHome}>Play again!</button>
                </div>
            ) : ''
            }
        </main>
    </div>
    );
}

export default App;
