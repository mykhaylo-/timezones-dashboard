
@Controller class JsApp { 

	@RequestMapping(value = "/{[path:[^\\.]*}")
	public String redirect() {
  		return "forward:/";
	}
}
