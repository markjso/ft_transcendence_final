import { Input, ListGroup } from "reactstrap";
import { Form, useLoaderData, useSubmit } from "react-router-dom";
import { getAllUsers, getFriendsList } from "../../../apicalls/ApiFriends";
import ListTemplate from "../friends/ListTemplate";

interface UserDetails {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  is_online: boolean;
  email: string;
  image_url: string;
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");
  let users: UserDetails[] = [];

  try {
    if (username) users = await getAllUsers(username);
    else {
      const response = await getFriendsList();
      users = response.friends;
    }
  } catch {
    throw new Response("error getting users", {
      status: 500,
      statusText: "Internal server error",
    });
  }
  return { users, username };
}

const SearchUsers = () => {
  const { users, username } = useLoaderData() as { users: UserDetails[]; username: string };
  const submit = useSubmit();

  return (
    <>
      <Form id="search-users" role="search" className="mt-2">
        <Input
          name="username"
          placeholder="Search By Username"
          type="search"
          defaultValue={username}
          autoComplete="off"
          onChange={(event) => {
            const isFIrstSearch = username === null;
            submit(event.currentTarget.form, {
              replace: !isFIrstSearch,
            });
          }}
        />
      </Form>

      <div className="mt-2">
        <ListGroup>
          {
            users.length > 0 &&
            users.map((user: UserDetails) =>
              <div key={user.id}>
                {ListTemplate(user)}
              </div>
            )
          }
        </ListGroup>
      </div>
    </>
  );
};

export default SearchUsers;
