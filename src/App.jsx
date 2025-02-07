import { useEffect, useState } from 'react';
import palette from './assets/palette.svg';

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
  const obj = [
    {
      target: '#86efac',
      options: [
        '#20D662',
        '#44E47E',
        '#70EB9D',
        '#86efac',
        '#9CF2BB',
        '#C9F8DA'
      ]
    },

    {
      target: '#f55a5a',
      options: [
        '#C01010',
        '#F9A2A2',
        '#ED1515',
        '#F24444',
        '#f55a5a',
        '#F67373'
      ]
    },

    {
      target: '#0074AB',
      options: [
        '#011D2A',
        '#0074AB',
        '#023F5D',
        '#02628F',
        '#0285C3',
        '#01A7F6'
      ]
    },
    {
      target: '#F27AD2',
      options: [
        '#D419A2',
        '#E937B9',
        '#EF64CA',
        '#F491DA',
        '#F9BFEA',
        '#F27AD2'
      ]
    }
  ];
  const [colorOptions, setColorOptions] = useState([
    '#C01010',
    '#F9A2A2',
    '#ED1515',
    '#F24444',
    '#f55a5a',
    '#F67373'
  ]);
  const styles = status.toLowerCase().includes('correct')
    ? '#16a34a'
    : status.toLowerCase().includes('wrong')
    ? '#dc2626'
    : 'transparent';
  const fetchRandomColor = () => {
    fetch('https://x-colors.yurace.pro/api/random')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTargetColor(data.hex.replace('#', ''));
        fetchColorScheme(data.hex.replace('#', ''));
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
        console.log(data);

        const newColorScheme = data?.colors?.map((e) => e.hex.value);

        newColorScheme.push(data?.seed?.hex.value);
        console.log(newColorScheme);
        setColorOptions(shuffle(newColorScheme));
        setLoading(false);
        setNextQuestionLoad(false);
      })
      .catch((err) => {
        setLoading(true);
        enqueueSnackbar('Check your network and try again!', 'error');
      });
  };

  const handleChange = (event) => {
    setChosenColor(event.target.value);
    if ('#' + targetColor === event.target.value) {
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
    }, 750);
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
          'Loading....'
        ) : (
          <section id='game'>
            <p id='instruction' data-testid='gameInstructions'>
              <strong>Instruction:</strong> Your objective is to guess the
              correct color out of the options provided. The target color is
              displayed below. Click on one of the color options that you
              believe matches the target color. Good luck and have fun!
            </p>

            {nextQuestionLoad ? (
              'Next Question incoming.....'
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
