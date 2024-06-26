import { Layout } from "@/components/site/Layout"
import { Input } from "./components/ui/input"
import { useEffect, useRef, useState } from "react"
import { useDebounce } from "./hooks/useDebounce"
import { Button } from "./components/ui/button"
import { HiMiniXCircle } from "react-icons/hi2"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./components/ui/card"

export type NpmPackage = {
	name: string
	version: string
	description: string
	links: {
		npm?: string
		homepage?: string
		repository?: string
		bugs?: string
	}
	author?: {
		name: string
		email?: string
		url?: string
	}

	publisher: {
		username: string
		email?: string
	}

	maintainers: Array<{
		username: string
		email: string
	}>
}
export type SearchResult = {
	package: NpmPackage
	score: {
		final: number
		detail: {
			quality: number
			popularity: number
			maintenance: number
		}
	}
	searchScore: number
}

const Tag = ({ children }: { children: React.ReactNode }) => (
	<span className="m-1 flex cursor-pointer flex-wrap items-center justify-between rounded-md bg-ring py-2 pl-4 pr-2 text-sm font-medium text-destructive-foreground">
		{children}
	</span>
)

const NpmSearch = () => {
	const [query, setQuery] = useState("")
	const [packages, setPackages] = useState<NpmPackage[]>([])
	const [tags, setTags] = useState<NpmPackage[]>([])
	const [showResults, setShowResults] = useState(false)

	const searchRef = useRef<HTMLDivElement>(null)

	const handleEscape = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			setQuery("")
			setShowResults(false)
		}
	}

	const handleClickOutside = (event: MouseEvent) => {
		if (
			searchRef.current &&
			!searchRef.current.contains(event.target as Node)
		) {
			setQuery("")
			setShowResults(false)
		}
	}

	useEffect(() => {
		window.addEventListener("keydown", handleEscape)
		document.addEventListener("mousedown", handleClickOutside)

		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
			window.removeEventListener("keydown", handleEscape)
		}
	}, [])

	const fetchNpmPackages = useDebounce((searchQuery: string) => {
		if (searchQuery) {
			fetch(`https://registry.npmjs.org/-/v1/search?text=${searchQuery}`)
				.then((response) => response.json())
				.then((data) =>
					setPackages(data.objects.map((obj: SearchResult) => obj.package)),
				)
				.catch((error) =>
					console.error("Error fetching data from NPM registry API: ", error),
				)
		}
	}, 500)

	useEffect(() => {
		fetchNpmPackages(query)
		return () => {
			fetchNpmPackages.cancel()
		}
	}, [query])

	const handleSelectPackage = (pkg: NpmPackage) => {
		setTags((prevTags) => [...prevTags, pkg])
		setQuery("")
	}
	const handleRemoveTag = (name: string) => {
		setTags(tags.filter((pkg) => pkg.name !== name))
	}

	useEffect(() => {
		setShowResults(packages.length > 0)
	}, [packages])

	useEffect(() => {
		if (!query) setShowResults(false)
	}, [query])

	return (
		<div ref={searchRef}>
			{tags.length > 0 && (
				<div className="mb-3 flex flex-wrap rounded-lg bg-muted px-2 pb-11 pt-2">
					{tags.map((pkg) => (
						<Tag key={pkg.name}>
							{pkg.name}
							<button onClick={() => handleRemoveTag(pkg.name)}>
								<HiMiniXCircle className="ml-1 size-6 hover:text-red-400" />
							</button>
						</Tag>
					))}
				</div>
			)}
			<div className="mt-1 flex w-full flex-col items-center text-sm">
				<div className="relative w-full">
					<div className="w-full sm:mb-2">
						<Input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							autoComplete="off"
							placeholder="Search for a package"
						/>{" "}
					</div>
					{showResults ? (
						<div className="absolute z-10 w-full">
							<Card
								className="mt-1 max-h-[400px] w-full overflow-y-auto overflow-x-hidden
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-gray-100
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  [&::-webkit-scrollbar]:w-2"
							>
								{packages.map((pkg) => (
									<Button
										key={pkg.name}
										type="button"
										variant="ghost"
										className="flex w-full items-center justify-between text-left"
										onClick={() => {
											handleSelectPackage(pkg)
										}}
										disabled={tags.includes(pkg)}
									>
										<span>{pkg.name}</span>
									</Button>
								))}
							</Card>
						</div>
					) : (
						<div></div>
					)}
				</div>
			</div>
		</div>
	)
}
const App = () => {
	return (
		<Layout>
			<Card>
				<CardHeader>
					<CardTitle>Tags Input Component with NPM Search</CardTitle>
					<CardDescription>
						Add NPM packages as tags to your project!
					</CardDescription>
				</CardHeader>
				<CardContent>
					<NpmSearch />
				</CardContent>
			</Card>
		</Layout>
	)
}
export default App
