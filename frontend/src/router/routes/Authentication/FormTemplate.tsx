import React from "react";
import pongImage from "../../../assets/pongball.jpeg";
import { Container, Col, Row, Card, CardBody } from "reactstrap";

interface LayoutProps {
  children: React.ReactNode;
}

const FormTemplate = (props: LayoutProps) => {
  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center">
      <Card className="text-black h-auto w-75">
        <Row className="d-flex justify-content-center align-items-center">
          <Col md="5" className="d-none d-md-block align-items-center">
            <div className="p-3">
              <img className="img-fluid border rounded" src={pongImage} alt="simple image" />
            </div>
          </Col>

          <Col sm="12" md="7" className="h-100 align-items-center">
            <CardBody className="h-100">{props.children}</CardBody>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default FormTemplate;
