import { Layout } from "@/components/site/Layout"
import { Input } from "./components/ui/input"
import { useEffect, useState } from "react"
import { useDebounce } from "./hooks/useDebounce"
const NpmSearch = () => {
	const [query, setQuery] = useState("")

	const fetchNpmPackages = useDebounce((searchQuery: string) => {
		if (searchQuery) {
			fetch(`https://registry.npmjs.org/-/v1/search?text=${searchQuery}`)
				.then((response) => response.json())
				.then((data) =>
					console.log(data.objects.map((obj: any) => obj.package)),
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

	return (
		<div>
			<Input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				autoComplete="off"
				placeholder="Search for a package"
			/>
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
