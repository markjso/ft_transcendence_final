interface BallProps {
  left: string;
  top: string;
}

const Ball = (props: BallProps) => {
  return (
    <div
      style={{
        position: "absolute",
        width: "2vh",
        height: "2vh",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        borderRadius: "50%",
        left: props.left,
        top: props.top,
      }}
    />
  );
};

export default Ball;
