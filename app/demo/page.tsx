"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Github, Terminal, Code, Zap, Palette } from "lucide-react";
import  Editor  from "./editor/editor";

const codeExample = `import { useState } from "react";
import Editor from "@flexreasonabilty/react-code-editor";

const Page = () => {
  const [value, setValue] = useState("");
  
  return (
    <Editor
      value={value}
      onChange={setValue}
      theme="dark"
      numberOfLines={true}
      language="javascript"
    />
  );
};

export default Page;`;

export default function HomePage() {
	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<div className="min-h-screen bg-background grid-pattern">
			{/* Header */}
			<header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
				<div className="container mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Code className="w-4 h-4 text-primary-foreground" />
							</div>
							<div>
								<h1 className="font-mono text-lg font-semibold text-foreground">
									react-code-editor
								</h1>
								<p className="text-xs text-muted-foreground">
									@flexreasonabilty
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<Badge variant="secondary" className="font-mono text-xs">
								v1.0.0
							</Badge>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									window.open(
										"https://github.com/FlexReasonability/code-editor",
										"_blank"
									)
								}
								className="gap-2"
							>
								<Github className="w-4 h-4" />
								GitHub
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="container mx-auto px-6 py-20">
				<div className="text-center max-w-4xl mx-auto">
					<Badge variant="secondary" className="mb-6 font-mono">
						React Code Editor
					</Badge>

					<h1 className="text-5xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
						The Modern React Code Editor
					</h1>

					<p className="text-xl text-muted-foreground text-balance mb-12 leading-relaxed">
						A powerful, customizable code editor component for React
						applications. Built with modern web technologies and designed for
						developers who value simplicity and performance.
					</p>

					{/* Installation */}
					<div className="mb-12">
						<div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-2">
									<Terminal className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium text-muted-foreground">
										Installation
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										copyToClipboard(
											"npm install @flexreasonabilty/react-code-editor"
										)
									}
									className="gap-2"
								>
									<Copy className="w-3 h-3" />
									Copy
								</Button>
							</div>
							<code className="font-mono text-sm text-foreground block bg-accent/50 p-3 rounded border">
								npm install @flexreasonabilty/react-code-editor
							</code>
						</div>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" className="gap-2">
							<Zap className="w-4 h-4" />
							Get Started
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={() =>
								window.open(
									"https://github.com/FlexReasonability/code-editor",
									"_blank"
								)
							}
							className="gap-2"
						>
							<Github className="w-4 h-4" />
							View on GitHub
						</Button>
					</div>
				</div>
			</section>

			{/* Code Example */}
			<section className="container mx-auto px-6 py-20">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4 text-balance">
							Simple to Use, Powerful by Design
						</h2>
						<p className="text-lg text-muted-foreground text-balance">
							Get started with just a few lines of code. Full TypeScript support
							included.
						</p>
					</div>

					<Card className="code-block p-0 overflow-hidden">
						<div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-accent/30">
							<div className="flex items-center gap-2">
								<div className="flex gap-1.5">
									<div className="w-3 h-3 rounded-full bg-red-500/80"></div>
									<div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
									<div className="w-3 h-3 rounded-full bg-green-500/80"></div>
								</div>
								<span className="text-sm font-mono text-muted-foreground ml-4">
									example.tsx
								</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									copyToClipboard(codeExample)
								}
								className="gap-2"
							>
								<Copy className="w-3 h-3" />
								Copy
							</Button>
						</div>
						<div className="p-6 font-mono text-sm overflow-x-auto">
							<Editor value={codeExample} readOnly theme="dark" />
						</div>
					</Card>
				</div>
			</section>

			{/* Features */}
			<section className="container mx-auto px-6 py-20">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold mb-4 text-balance">
							Everything You Need
						</h2>
						<p className="text-lg text-muted-foreground text-balance">
							Built with modern React patterns and best practices in mind.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<Code className="w-6 h-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-3">
								Syntax Highlighting
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Built-in syntax highlighting for JavaScript, TypeScript, and
								many other languages.
							</p>
						</Card>

						<Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<Palette className="w-6 h-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-3">Dark Theme</h3>
							<p className="text-muted-foreground leading-relaxed">
								Beautiful dark theme that's easy on the eyes and perfect for
								modern applications.
							</p>
						</Card>

						<Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
							<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
								<Zap className="w-6 h-6 text-primary" />
							</div>
							<h3 className="text-xl font-semibold mb-3">TypeScript Ready</h3>
							<p className="text-muted-foreground leading-relaxed">
								Full TypeScript support with comprehensive type definitions
								included.
							</p>
						</Card>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
				<div className="container mx-auto px-6 py-12">
					<div className="flex flex-col md:flex-row items-center justify-between gap-6">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Code className="w-4 h-4 text-primary-foreground" />
							</div>
							<div>
								<p className="font-mono font-semibold">
									@flexreasonabilty/react-code-editor
								</p>
								<p className="text-sm text-muted-foreground">
									Modern React Code Editor
								</p>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									window.open(
										"https://github.com/FlexReasonability/code-editor",
										"_blank"
									)
								}
								className="gap-2"
							>
								<Github className="w-4 h-4" />
								GitHub
							</Button>
						</div>
					</div>

					<div className="mt-8 pt-8 border-t border-border/50 text-center">
						<p className="text-sm text-muted-foreground">
							Built with ❤️ by FlexReasonability
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
