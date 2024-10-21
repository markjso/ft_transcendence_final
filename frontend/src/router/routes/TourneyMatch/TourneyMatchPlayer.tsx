interface TourneyPlayerProps {
  color: string;
  left: string;
  top: string
}

const TourneyPlayer = (props: TourneyPlayerProps) => {
  return (
    <div
      style={{ position: "absolute", left: `${props.left}%`, top: props.top, width: "4%", height: "20%", backgroundColor: props.color }}
    />
  );
};

export default TourneyPlayer;
