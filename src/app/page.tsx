import Image from "next/image";

const HomePage = () => {
  return (
    <div className="flex justify-center">
      <video
        src="https://cdn.shopify.com/videos/c/o/v/24cdc3402a91437fae7e4feee9aed06c.mp4"
        autoPlay
        muted
        loop
        className="w-[900px] h-[863px] object-cover"
      />
    </div>
  );
};

export default HomePage;
