import { useEffect, useState } from 'react';
import palette from './assets/palette.svg';
import wheel from './assets/wheel.gif';

import './App.css';
import ConfettiExplosion from 'react-confetti-explosion';
import { enqueueSnackbar } from 'notistack';

function App() {
  const [loading, setLoading] = useState(false);
  const [nextQuestionLoad, setNextQuestionLoad] = useState(false);
  const [wrongAnim, setWrongAnim] = useState('');
  const [rightAnim, setRightAnim] = useState('');
  const [isExploding, setIsExploding] = useState(false);
  const [targetColor, setTargetColor] = useState('');
  const [chosenColor, setChosenColor] = useState('');
  const [status, setStatus] = useState('');
  const [score, setScore] = useState(0);
  const [colorOptions, setColorOptions] = useState([]);

  const styles = status.toLowerCase().includes('correct')
    ? '#16a34a'
    : status.toLowerCase().includes('wrong')
    ? '#dc2626'
    : 'transparent';

  const fetchRandomColor = () => {
    fetch('https://x-colors.yurace.pro/api/random')
      .then((res) => res.json())
      .then((data) => {
        setTargetColor(data.hex.replace('#', ''));
        fetchColorScheme(data.hex.replace('#', ''));
      })
      .catch(() => {
        // setLoading(true);
        let arr = ['#664c43', '#873d48', '#dc758f', '#e3d3e4', '#00ffcd'];
        let num = Math.floor(Math.random() * arr.length);

        let random = arr[num];
        setTargetColor(random.replace('#', ''));
        fetchColorScheme(random.replace('#', ''));
      });
  };

  const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const fetchColorScheme = (color) => {
    fetch(
      `https://www.thecolorapi.com/scheme?hex=${color}&mode=analogic-complement`
    )
      .then((res) => res.json())
      .then((data) => {
        const newColorScheme = data?.colors?.map((e) => e.hex.value);

        newColorScheme.push(data?.seed?.hex.value);

        setColorOptions(shuffle(newColorScheme));
        setLoading(false);
        setNextQuestionLoad(false);
      })
      .catch(() => {
        setLoading(true);
        enqueueSnackbar('Check your network and try again!', {
          variant: 'error'
        });
      });
  };

  const handleChange = (event) => {
    setChosenColor(event.target.value);
    if (
      ('#' + targetColor).toLowerCase() === event.target.value.toLowerCase()
    ) {
      setStatus('Correct!');
      setScore(score + 1);
      setIsExploding(true);
      setRightAnim('bounce-top');
    } else {
      setStatus('Wrong!');
      setWrongAnim('wobble-hor-bottom');
    }

    setTimeout(() => {
      setIsExploding(false);
      setRightAnim('');
      setWrongAnim('');
      setNextQuestionLoad(true);
      setStatus('');
      fetchRandomColor();
    }, 1000);
  };

  const resetGame = () => {
    setLoading(true);
    setScore(0);
    setStatus('');
    fetchRandomColor();
  };

  useEffect(() => {
    setLoading(true);
    fetchRandomColor();
  }, [0]);

  return (
    <>
      <header>
        <img src={palette} alt='' />

        <h1>ColorGuessGame</h1>
      </header>
      <main>
        {loading ? (
          <div className='loader'>
            <img src={wheel} />

            <p>Loading.....</p>
          </div>
        ) : (
          <section id='game'>
            <p id='instruction' data-testid='gameInstructions'>
              <strong>Instruction:</strong> Your objective is to guess the
              correct color out of the options provided. The target color is
              displayed below. Click on one of the color options that you
              believe matches the target color. Good luck and have fun!
            </p>

            {nextQuestionLoad ? (
              <div className='loader'>
                <img src={wheel} />

                <p>Next Question incoming.....</p>
              </div>
            ) : (
              <>
                <div id='colorBox' className={wrongAnim + ' ' + rightAnim}>
                  <div
                    id='targetColor'
                    style={{
                      backgroundColor: '#' + targetColor
                    }}
                    data-testid='colorBox'
                  ></div>
                  {isExploding && (
                    <>
                      <ConfettiExplosion
                        width={1000}
                        force={1}
                        onComplete={() => setIsExploding(false)}
                      />
                    </>
                  )}
                </div>

                <form>
                  {colorOptions.map((color, i) => (
                    <div key={i}>
                      <input
                        type='radio'
                        name='colors'
                        id={i + 1}
                        value={color}
                        onChange={handleChange}
                        checked={chosenColor === color}
                      />

                      <label
                        style={
                          chosenColor === color
                            ? {
                                backgroundColor: color,
                                outline: `4px solid ${styles}`
                              }
                            : { backgroundColor: color }
                        }
                        data-testid='colorOption'
                        htmlFor={i + 1}
                      ></label>
                    </div>
                  ))}
                </form>
              </>
            )}

            <div id='extra'>
              <p data-testid='score' id='score'>
                Score: {score}
              </p>
              <p data-testid='gameStatus' style={{ color: styles }} id='status'>
                {status}
              </p>

              <button onClick={resetGame} data-testid='newGameButton'>
                New Game
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default App;
