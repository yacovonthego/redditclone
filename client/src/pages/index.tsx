import { withUrqlClient } from "next-urql";
import NavBar from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import CreateUrqlClient from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <NavBar />
      <div>hello cunt</div>
      {!data ? (
        <div>loading ... </div>
      ) : (
        data.posts.map((post) => <div key={post._id}>{post.title}</div>)
      )}
    </>
  );
};

export default withUrqlClient(CreateUrqlClient, { ssr: true })(Index);
