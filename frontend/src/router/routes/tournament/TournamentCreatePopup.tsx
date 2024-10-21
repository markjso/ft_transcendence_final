import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from 'reactstrap';
import { createTournament } from './ApiTournament';

interface CreateTournamentModalProps {
  isOpen: boolean;
  toggle: () => void;
  onTournamentCreated: () => void;
}

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  toggle,
  onTournamentCreated
}) => {
  const [newTournamentName, setNewTournamentName] = useState('');
  const [newTournamentSize, setNewTournamentSize] = useState(2);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateTournament = async () => {
    try {
      if (newTournamentName.length <= 15) {
        await createTournament(newTournamentName, newTournamentSize);
        setNewTournamentName('');
        onTournamentCreated();
        toggle();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 405) {
        setErrorMessage('Tournament name already exists. Please choose a different name.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handleCreateTournament();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value.length > 15) {
      setErrorMessage('Tournament name cannot exceed 15 characters.');
    } else {
      setErrorMessage(null);
      setNewTournamentName(value);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} onKeyDown={handleKeyDown}>
      <ModalHeader toggle={toggle}>Create New Tournament</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="tournamentName">Tournament Name</Label>
          <Input
            type="text"
            id="tournamentName"
            placeholder="Tournament Name"
            value={newTournamentName}
            onChange={handleNameChange}
          />
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </FormGroup>
        <FormGroup>
          <Label for="tournamentSize">Tournament Size</Label>
          <Input
            type="select"
            id="tournamentSize"
            value={newTournamentSize}
            onChange={(e) => setNewTournamentSize(Number(e.target.value))}
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
          </Input>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          onClick={handleCreateTournament}
          disabled={newTournamentName.length > 15 || newTournamentName.length === 0}
        >
          Create
        </Button>
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreateTournamentModal;
