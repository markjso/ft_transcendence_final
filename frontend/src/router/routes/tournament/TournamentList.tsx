import React, { useState } from 'react';
import { Button, ListGroup, ListGroupItem, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Container } from 'reactstrap';
import CreateTournamentModal from './TournamentCreatePopup';
import PlayerList from './PlayerList';
import TabView from './TabView'
import { TabState } from './Tournament';
import { TournamentDetails, PlayerDetails, UserDetails } from './interfaces';

interface TournamentListProps {
  currentuser: UserDetails;
  tournaments: TournamentDetails[];
  currentTab: TabState;
  currentUserId: number;
  players: PlayerDetails[];
  isUserInTournament: boolean;
  setCurrentTab: (tab: TabState) => void;
  fetchData: () => void;
  showPlayerList: (tournamentId: number) => void;
  handleJoin: () => void;
  handleLeave: () => void;
  handleDelete: (tournamentId: number) => void;
  handlestart: () => void;
}

const TournamentList: React.FC<TournamentListProps> = ({
  currentuser,
  tournaments,
  currentTab,
  currentUserId,
  players,
  isUserInTournament,
  setCurrentTab,
  fetchData,
  showPlayerList,
  handleJoin,
  handleLeave,
  handleDelete,
  handlestart
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTournament, setExpandedTournament] = useState(0);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const togglePlayersView = (tournamentId: number) => {
    if (expandedTournament === tournamentId) {
      setExpandedTournament(0);
    } else {
      setExpandedTournament(tournamentId);
      showPlayerList(tournamentId);
    }
  };

  return (
    <div>
      <CreateTournamentModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        onTournamentCreated={fetchData}
      />

      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ marginBottom: '20px', marginTop: '20px' }}
      >
        <h5>Tournaments</h5>
        <Button
          className='bi-pencil-square'
          color="dark"
          onClick={toggleModal}
          style={{
            marginLeft: '10px'
          }}
        >
        </Button>
      </Container>

      <TabView
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <ListGroup
        style={{
          marginTop: '10px',
          minHeight: "30vh",
          maxHeight: '62vh',
          overflowY: 'auto',
        }}
      >
        {tournaments.length > 0 ? (
          tournaments.map(tournament => (
            <div
              key={tournament.id}
              style={{
                borderRadius: "10px",
                paddingTop: "10px"
              }}
            >
              <ListGroupItem
                onClick={() => togglePlayersView(tournament.id)}
                className="d-flex justify-content-between align-items-center"
                style={{
                  cursor: 'pointer'
                }}
              >
                <div className="d-flex align-items-center"
                  style={{
                    width: '100%',
                    height: '40px'
                  }}
                >
                  <div style={{ flex: '2', textAlign: 'center' }}>
                    <strong>{tournament.name}</strong>
                  </div>
                  <div style={{ flex: '1', textAlign: 'center' }}>
                    <strong>{tournament.current_size} / {tournament.max_size}</strong>
                  </div>
                </div>

                <UncontrolledDropdown>
                  <DropdownToggle
                    tag="span"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: 'pointer' }}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </DropdownToggle>
                  <DropdownMenu
                    style={{
                      borderRadius: '10px',
                    }}
                  >
                    <DropdownItem
                      onClick={() => handleDelete(tournament.id)}
                      style={{
                        color: '#F00000',
                        background: 'white'
                      }}
                      disabled={tournament.host.id !== currentUserId}
                    >
                      <i className="bi bi-trash"
                        style={{
                           margin: '7px',
                           opacity: tournament.host.id === currentuser.id ? 1.0 : 0.3
                        }}
                      >
                        Delete
                      </i>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </ListGroupItem>

              {/* Collapsible player list */}
              {expandedTournament === tournament.id && (
                <div
                  style={{
                    backgroundColor: '#f9f9f9',
                    borderBottomLeftRadius: "15px",
                    borderBottomRightRadius: "15px",
                  }}
                >
                  <PlayerList
                    currentuser={currentuser}
                    currentTournament={tournament}
                    players={players}
                    isUserInTournament={isUserInTournament}
                    currentUserId={currentUserId}
                    handleJoin={handleJoin}
                    handleLeave={handleLeave}
                    handleStart={handlestart}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div
            style={{
              borderRadius: "10px",
              paddingTop: "10px"
            }}
          >
            <ListGroupItem>
              <div className="d-flex align-items-center"
                style={{
                  width: '100%',
                  height: '40px'
                }}
              >
                No Tournaments found
              </div>
            </ListGroupItem>
          </div>
        )}
      </ListGroup>
    </div>
  );
};

export default TournamentList;
