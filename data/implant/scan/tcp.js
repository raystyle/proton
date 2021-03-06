//            ---------------------------------------------------
//                             Proton Framework              
//            ---------------------------------------------------
//                Copyright (C) <2019-2020>  <Entynetproject>
//
//        This program is free software: you can redistribute it and/or modify
//        it under the terms of the GNU General Public License as published by
//        the Free Software Foundation, either version 3 of the License, or
//        any later version.
//
//        This program is distributed in the hope that it will be useful,
//        but WITHOUT ANY WARRANTY; without even the implied warranty of
//        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
//        GNU General Public License for more details.
//
//        You should have received a copy of the GNU General Public License
//        along with this program.  If not, see <http://www.gnu.org/licenses/>.

function TestPortMSHTA(url)
{
    var ret = {};
    ret.status = "unknown";
    ret.errno = -1;

    var ABNORMAL_TERMINATION = -2147012866;
    var UNSUPPORTED_PORT = -2147012795;
    var CONNECTION_ERROR = -2147012867;
    var WRONG_PROTOCOL = -2147012744;
    var OPERATION_CANCELED = -2147012879;

    try
    {
        var objHTTP = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
        objHTTP.Open("GET", url, true);
        objHTTP.Send();
        objHTTP.WaitForResponse(~TIMEOUT~);

        ret.status = "open";
        ret.errno = 0;
    }
    catch(err)
    {
        ret.errno = err.number;

        if (err.number == UNSUPPORTED_PORT)
            ret.status = "unsupported";
        else if (err.number == CONNECTION_ERROR)
            ret.status = "closed";
        else if (err.number == WRONG_PROTOCOL || err.number == ABNORMAL_TERMINATION || err.number == OPERATION_CANCELED)
            ret.status = "open";
    }

    return ret;
}

function TestPort(ip, port)
{
    var url = "http://" + ip + ":" + port;
    return TestPortMSHTA(url);
}


~RHOSTSARRAY~

~RPORTSARRAY~

function status_string(status, ip, port, err)
{
    return status + "\n" + ip + "\n" + port + "\n" + err;
}

try
{
    for (var idx in ips)
    {
        var ip = ips[idx];
        var test = "closed";
        var testerrno = 0;
        if (~CHECKLIVE~)
        {
            // ghetto check if the IP is up
            var testport = TestPort(ip, 1);
            test = testport.status;
            testerrno = testport.errno;
        }
        if (test == "closed")
        {
            for (var pdx in ports)
            {
                var port = ports[pdx];
                var ret = TestPort(ip, port);
                proton.work.report(status_string(ret.status, ip, port, ret.errno));
            }
        }
        else
        {
            proton.work.report(status_string("not up", ip, 1, testerrno));
        }
    }

    proton.work.report("done");
}
catch(e)
{
    proton.work.error(e);
}

proton.exit();
