import { Layout } from "@/components/site/Layout"
import { Input } from "./components/ui/input"
import { useEffect, useState } from "react"
import { useDebounce } from "./hooks/useDebounce"
import { Button } from "./components/ui/button"

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

const NpmSearch = () => {
	const [query, setQuery] = useState("")
	const [packages, setPackages] = useState<NpmPackage[]>([])
	const [tags, setTags] = useState<NpmPackage[]>([])

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

	return (
		<div>
			{tags.length > 0 && (
				<div className="mb-3 flex flex-wrap rounded-lg bg-muted px-2 pb-11 pt-2">
					{tags.map((pkg) => (
						<span
							className="m-1 flex cursor-pointer flex-wrap items-center justify-between rounded-md bg-ring p-2 text-sm font-medium text-destructive-foreground"
							key={pkg.name}
						>
							{pkg.name}
						</span>
					))}
				</div>
			)}
			<Input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				autoComplete="off"
				placeholder="Search for a package"
			/>
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
		</div>
	)
}
const App = () => {
	return (
		<Layout>
			<NpmSearch />
		</Layout>
	)
}
export default App
