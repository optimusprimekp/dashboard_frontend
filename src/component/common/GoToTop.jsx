import PagesIndex from "./PagesIndex";

export default function GoToTop() {
  const routePath = PagesIndex.useLocation();
  const onTop = () => {
    window.scrollTo(0, 0);
  }
  PagesIndex.useEffect(() => {
    onTop()
  }, [routePath]);
  
  return null;
}