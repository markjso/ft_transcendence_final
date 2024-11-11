export const styles = {
  middleLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: '2px',
    borderLeft: '5px dashed white'
  },
  centerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '15vh',
    height: '15vh',
    borderRadius: '50%',
    backgroundColor: '#3a3a3a',
    border: '2px solid white'
  },
  pongArea: {
    position: 'relative',
    left: '50%',
    transform: 'translate(-50%, 0%)',
    width: '80vw',
    height: '80vw',
    maxWidth: '800px',
    maxHeight: '600px',
    backgroundColor: '#3a3a3a',
    border: '2px solid #000',
    zIndex: 0
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '2em',
    visibility: 'hidden',
    zIndex: 2
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 'auto'
  },
  leftImage: {
    width: '100%',
    height: 'auto'
  },
  menu: {
    width: '35%',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
  },
  absoluteButton: {
    position: 'absolute',
    top: '30%',
    left: '72%',
    width: '15%',
    zIndex: 1
  },
  settingsButton: {
    position: 'absolute',
    top: '40%',
    left: '72%',
    width: '15%',
    zIndex: 1
  }
};

interface ScoreBoardProps {
  leftScore: number;
  rightScore: number;
}

export const ScoreBoard = (props: ScoreBoardProps) => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: '0px', 
      width: '100%', 
      display: 'flex',
      justifyContent: 'center',
      color: 'white', 
      fontSize: '4em',
      zIndex: '2' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '30%'
      }}>
        <div>{props.leftScore}</div>
        <div>{props.rightScore}</div>
    </div>
    </div>
  );
};

interface TimerProps {
  minutes: number;
  seconds: number;
}

export const Timer = (props: TimerProps) => {
  const formattedSeconds = `${props.seconds}`.padStart(2, '0');
  return (
    <div style={{ 
      position: 'absolute', 
      width: '99%', 
      textAlign: 'right',
      color: 'grey', 
      fontSize: '2em', 
      zIndex: '2' }}>
      {props.minutes} : {formattedSeconds}
    </div>
  );
};