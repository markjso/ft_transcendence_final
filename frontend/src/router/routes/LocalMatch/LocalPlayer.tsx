interface LocalPlayerProps {
  color: string;
  left: string;
  top: string;
}

const LocalPlayer = (props: LocalPlayerProps) => {
  return (
    <div
      style={{ position: "absolute", left: `${props.left}%`, top: props.top, width: "4%", height: "20%", backgroundColor: props.color }}
    ></div>
  );
};

export default LocalPlayer;
