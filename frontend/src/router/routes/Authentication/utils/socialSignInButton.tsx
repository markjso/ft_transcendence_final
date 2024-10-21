import { Button } from "reactstrap";

interface SocialSignInButtonProps {
  redirectUri: string;
  icon: string;
  message: string;
}

export const SocialSignInButton = (props: SocialSignInButtonProps) => {
  return (
    <Button
      color="secondary"
      outline
      className="w-100 d-flex align-items-center justify-content-center"
      href={props.redirectUri}
      style={{
        fontSize: '16px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}
    >
      {props.message}
      <img src={props.icon} alt="Custom Icon" style={{ width: '24px', height: '24px', marginLeft: '8px' }} />
    </Button>
  );
};