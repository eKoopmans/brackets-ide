import std.stdio;
// Comment
void main()
{
    /* Block
    comment
    */
    writeln("Hello, world without explicit compilations!");
}
/*
template parseInteger(const(char)[] s)
{
    static if (s.length == 0)
    {
        enum value = "";
        enum rest = "";
    }
    else static if (s[0] >= '0' && s[0] <= '9')
    {
        enum value = s[0] ~ parseUinteger!(s[1..$]).value;
        enum rest = parseUinteger!(s[1..$]).rest;
    }
    else static if (s.length >= 2 &&
            s[0] == '-' && s[1] >= '0' && s[1] <= '9')
    {
        enum value = s[0..2] ~ parseUinteger!(s[2..$]).value;
        enum rest = parseUinteger!(s[2..$]).rest;
    }
    else
    {
        enum value = "";
        enum rest = s;
    }
}

unittest
{
    assert(parseUinteger!("1234abc").value == "1234");
    assert(parseUinteger!("1234abc").rest == "abc");
    assert(parseInteger!("-1234abc").value == "-1234");
    assert(parseInteger!("-1234abc").rest == "abc");
}*/