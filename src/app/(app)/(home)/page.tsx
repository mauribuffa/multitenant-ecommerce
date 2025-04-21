import configPromise from "@payload-config";
import { getPayload } from "payload";

const HomePage = async () => {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
  });

  return <div>{JSON.stringify(data)}</div>;
};

export default HomePage;
