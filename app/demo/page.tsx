"use client";
import { useState } from "react";
import Editor from "./editor/editor";

const Page = () => {
	const [value, setValue] = useState("");
	return (
		<div className="h-full w-full">
			<Editor
				value={value}
				onChange={setValue}
				theme="dark"
				numberOfLines={true}
				language="javascript"
			/>
		</div>
	);
};

export default Page;
