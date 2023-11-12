def is_logged_in(req)->bool:
	if req.cookies.get('userID', None) is None:
		return False
	# TODO: Check is user is authentic.
	return True