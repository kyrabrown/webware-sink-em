import {useRef, useState} from "react";
import "./App.css";
import Grid from "./Grid.jsx";

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
    const [opponentDisplayName, setOpponentDisplayName] = useState("Opponent")

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
                    setUserMessage("Your opponent has disconnected. The game has been reset. Reload to create a new game.")
                } else if (type === "StartPlacing") {
                    setUserMessage(type)
                    setOpponentDisplayName(payload.OpponentDisplayName)
                    //change game state
                    setIsWaitingForReady(false)
                    setIsPlacing(true)
                } else if (type === "Firing") {
                    setUserMessage(type + payload.YourTurn)

                    //update boards
                    setFiringGridVals(payload.guessGrid)
                    setPlacingGridVals(payload.placingGrid)

                    //start the firing stage of the game!
                    setIsPlacing(false)
                    setIsFiring(true)

                    //check if current player's turn
                    if (payload.YourTurn) {
                        //upon receiving the opponent's hit/miss update, show your personal board
                        //for 5 seconds before moving to showing your firing board

                        //do firing functionality to get user's guess square coordinates
                        setTimeout(() => {
                            setIsMyFireTurn(true)
                            startTimer()
                        }, 5000)

                        //after firing has completed, send coordinates of square back to the server
                    } else {
                        //upon receiving the your previous shot's hit/miss update, show your guess board
                        //for 5 seconds before moving to showing your personal board

                        setTimeout(() => {
                            //wait on other user to fire
                            setIsMyFireTurn(false)
                        }, 5000)
                    }

                } else if (type === "End") {
                    //game has ended, display winner
                    console.log(payload.Winner)
                    setUserMessage("Winner: " + payload.Winner)
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

        //update grid
        sendFiringSquare(x,y)
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

    const submitPlacements = () => {
        console.log("sending placement grid")
        const tempGrid = placingGridVals.map(row => [...row]);
        console.log("placing grid cals", placingGridVals)
        ws.current.send(JSON.stringify({type: 'Placed', payload: {Placements: placingGridVals}}));
    }

    const sendFiringSquare = (x, y) => {
        console.log("sending firing guess square:", x, y)
        ws.current.send(JSON.stringify({type: 'FiringGuess', payload: {GuessX: x, GuessY: y}}));
    }

    function startTimer () {
      setTimer(30)
        const interval = setInterval(() => {
          setTimer((t) => {
            if (t === 0) {
              clearInterval(interval)
              setIsMyFireTurn(false)
            }
            return t - 1
          })
        }, 1000)
    }

    return (
        <div className="App">
            <h1> Sink 'Em</h1>
            {userMessage}
            {!gameCreated && !joiningGame && (
                <div>
                    <button onClick={makeGame}>Create Game</button>
                    <br></br>
                    <br></br>
                    <button onClick={() => {setJoiningGame(true); setUserMessage('')}}>Join Existing Game</button>
                </div>
            )}

            {joiningGame && !gameCreated && (

                <div>
                    <p>Enter code here:</p>
                    <input type="text" value={joinCode} onChange={(i) => setJoinCode(i.target.value)}/>
                    <br></br>
                    <br></br>
                    <button onClick={joinGame}>Join game</button>
                </div>

            )}

            {gameCreated && isWaitingForReady && (
                <div>
                    <p>Your code is: <strong>{gameCode}</strong></p>
                    <p>Choose a display name:</p>
                    <div>
                        <input type="text" value={displayName} onChange={(i) => setDisplayName(i.target.value)}/>
                    </div>
                    <button onClick={sendReadyToStart}> Ready</button>
                </div>
            )}



            {isPlacing ?
                (
                    <div>
                        <p>You are: {displayName}</p>
                        <p>You're up against: {opponentDisplayName}</p>
                        <Grid gridVals={placingGridVals} handleSquareChoice={updateSquareChoicePlacing}></Grid>
                        <button onClick={submitPlacements}> Submit Placements</button>
                    </div>
                )
                : ''}
            {isFiring && isMyFireTurn ?
                (<div>
                        <p> Choose a square to fire at....</p>
                        <p>Time remaining: {timer} </p>
                        <Grid gridVals={firingGridVals} handleSquareChoice={updateSquareChoiceFiring}></Grid>
                        <button onClick={submitPlacements}> Submit Fire Location</button>
                    </div>
                )
                : ''}
            {isFiring && !isMyFireTurn ?
                (<div>
                        <p> {opponentDisplayName} is guessing...</p>
                        <Grid gridVals={placingGridVals} handleSquareChoice={() => console.log(`Clicked square`)}></Grid>
                    </div>
                )
                : ''}
            {isGameEnded ? (
                <p> Game has ended</p>) : ''
            }
        </div>
    );
}

export default App;
