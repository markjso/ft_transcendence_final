import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string;
  const navigate = useNavigate();

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  return (
    <div className="vh-100 bg-black text-light">
    <div id="error-page" className="d-flex flex-column justify-content-center align-items-center h-100">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{errorMessage}</i>
      </p>
      <Button onClick={() => navigate("/")} color="primary">
        Home
      </Button>
    </div>
    </div>
  );
}
