import { Input, FormGroup, InputGroup } from "reactstrap";

type InputFieldsProps = {
  type?: any; 
  placeholder: string;
  name: string;
  currentValue: string;
  changlehandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
  minLength?: number;
  pattern?: string;
};

export const InputFields = (props: InputFieldsProps) => {
  return (
    <>
      <FormGroup>
        <InputGroup>
          <Input
            className="form-control"
            placeholder={props.placeholder}
            type={props.type ? props.type : (props.name.indexOf("password") !== -1 ? "password" : "text")}
            name={props.name}
            value={props.currentValue}
            required
            autoComplete={props.name.indexOf("password") !== -1 ? "on" : "off"}
            onChange={props.changlehandler}
            minLength={props.minLength}
          />
          {props.children ? props.children : <></>}
        </InputGroup>
      </FormGroup>
    </>
  );
};